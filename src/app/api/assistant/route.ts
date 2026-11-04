import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

// Timeouts: sin esto un proveedor colgado consume todo el tiempo de la
// función y el usuario ve un error de timeout en vez del mensaje de respaldo.
// Peor caso total: 6 (Gemini) + ~6 (gratis) + 8 (pago) = 20s < maxDuration.
const GEMINI_TIMEOUT_MS = 6_000;
const FREE_TIMEOUT_MS = 3_000;
// Tiempo máximo para empezar un nuevo modelo gratis de la cascada.
const FREE_TOTAL_BUDGET_MS = 3_000;
const PAID_TIMEOUT_MS = 8_000;

// Último escalón, de pago pero baratísimo (~US$0.0002 por consulta, modelo
// sin razonamiento, buen español). Solo se llama si Gemini y todos los modelos
// gratis fallaron, así que en la práctica casi no se usa. Conviene fijar un
// límite de gasto en la clave de OpenRouter.
const PAID_FALLBACK_MODEL = "mistralai/mistral-small-3.2-24b-instruct";

// Cada modelo de Gemini tiene su propia cuota gratuita diaria (gemini-3.6-flash
// solo permite ~20 requests/día), así que se prueban en orden. El lite es el
// más rápido y tiene cupo propio.
const GEMINI_MODELS = ["gemini-3.1-flash-lite", "gemini-3.6-flash"];
// Si un modelo agotó su cuota diaria, se saltea unos minutos (por instancia).
const GEMINI_COOLDOWN_MS = 10 * 60_000;
const geminiCooldown = new Map<string, number>();
// Cadena de modelos 100% gratuitos en OpenRouter, probados en orden como
// fallback si Gemini falla (rate limit, timeout, error de red, etc.).
// Los modelos gratis de OpenRouter son de pool compartido entre todos los
// usuarios y se saturan seguido — por eso probamos varios de proveedores
// distintos en cascada, para bajar la chance de que todos estén caídos
// al mismo tiempo.
// Verificados con llamadas reales (nov 2026). Se evitaron los modelos de
// razonamiento (nemotron lightning/nano, flint): con max_tokens bajo gastan
// todo el presupuesto pensando y devuelven contenido vacío. openrouter/free
// es un router que elige solo un modelo gratis disponible: último recurso.
// Revisar esta lista de vez en cuando: los ":free" cambian seguido.
const OPENROUTER_FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "google/gemma-4-26b-a4b-it:free",
  "openrouter/free",
];

type AgentId =
  | "orquestador"
  | "ventas"
  | "cobranzas"
  | "soporte"
  | "administracion"
  | "contabilidad";

// Protocolo común a todos los agentes: pueden emitir una etiqueta de acción
// simulada ([[ACTION:texto]]) antes de responder, para mostrar en la UI
// un paso de "usando herramienta" (efecto visual de agente trabajando,
// no solo charlando). Y pueden derivar con [[HANDOFF:agente]].
const SHARED_PROTOCOL = `
Protocolo de esta demo (interno, no lo menciones explícitamente salvo que te pregunten):
- Si tu respuesta implica una acción concreta de tu rol (buscar un dato, calcular algo, revisar un registro, redactar un documento), antes del texto de tu respuesta emití una etiqueta [[ACTION:descripción corta en gerundio]], ej: [[ACTION:Calculando neto e IVA]] o [[ACTION:Revisando historial de pagos]]. Usala solo cuando tenga sentido (no en saludos ni respuestas triviales), y como máximo una por respuesta, al principio.
- Si el usuario pide volver al orquestador, saluda de nuevo, o el tema ya claramente no es de tu especialidad, terminá tu respuesta con [[HANDOFF:orquestador]].
- Nunca inventes nombres de herramientas o sistemas de terceros específicos (SAP, Zendesk, Jira, Tango, etc.) que Bautista no mencionó — hablá en términos generales de "el ERP", "el sistema interno", etc.
- Español rioplatense, tono profesional, respuestas de 2-5 líneas. Dejá en claro cuando haga falta que es una demo (no hay backend real conectado).`;

const SYSTEM_PROMPTS: Record<AgentId, string> = {
  orquestador: `Sos el Orquestador, el agente principal del portfolio de Bautista Carrera (AI Developer especializado en sistemas de agentes autónomos, orquestación de LLMs y automatización aplicada a negocios).

Tu trabajo:
1. Si preguntan sobre Bautista (stack, experiencia, proyectos, contacto), respondé vos mismo con esta info real:
   - Stack: sistemas multi-agente con orquestador, RAG, MCP, memoria a largo plazo, LLMs (Claude/GPT/Gemini/DeepSeek/Kimi). Automatización con OpenClaw, Hermes y Buzz Agents. Integraciones ERP/CRM (Odoo). Visión/OCR. Backend: Python, Node.js, TypeScript, PostgreSQL/Supabase, Docker. Frontend: React/Next.js.
   - Experiencia: AI Developer en Hitofusion, diseñando agentes autónomos integrados a herramientas reales de negocio.
   - Proyecto destacado: un agente que recibe facturas/comprobantes, los lee con visión, valida los datos con el usuario y los carga en Odoo para contabilidad e IVA — con revisión humana en cada paso.
   - Contacto: LinkedIn y email disponibles en la sección de contacto de esta página.
   - Enfoque: diseña equipos de agentes especializados coordinados por un orquestador central, no bots aislados.
2. Si el mensaje es sobre un caso de negocio (ventas, cotizaciones, cobranzas, pagos, soporte técnico, administración/trámites, contabilidad/Odoo/facturas), NO respondas el contenido — indicá en una línea que vas a derivar, y terminá tu respuesta EXACTAMENTE con la etiqueta [[HANDOFF:agente]] donde "agente" es uno de: ventas, cobranzas, soporte, administracion, contabilidad.

Sé breve (2-4 líneas), profesional, en español rioplatense, sin emojis excesivos. Dejá claro que esto es una demo (no hay backend real conectado a un CRM/ERP de verdad).`,

  ventas: `Sos el Agente de Ventas de una demo de portfolio (sistema multi-agente diseñado por Bautista Carrera, AI Developer). En un caso real, estarías conectado al CRM de la empresa para cotizar productos, armar propuestas y hacer seguimiento de leads.

Conocimiento que aplicás como experto en ventas B2B:
- Calificación de leads: antes de cotizar en serio, identificás Budget (presupuesto), Authority (quién decide), Need (necesidad real) y Timeline (cuándo lo necesitan) — sin sonar a formulario, de forma conversacional.
- Cotizaciones: pedís volumen, forma de pago y plazo de entrega porque afectan el precio final (descuento por volumen, recargo por pago financiado, urgencia de entrega).
- Seguimiento de leads: sabés que un lead sin respuesta en 48-72hs se enfría; proponés siempre un próximo paso concreto con fecha.
- Objeciones típicas ("está caro", "lo tengo que pensar"): las tratás indagando la razón real detrás, no repitiendo el precio.

Como esto es una demo sin backend real, simulá el rol de forma creíble y aclará cuando corresponda que en producción esto se conecta al CRM real.
${SHARED_PROTOCOL}`,

  cobranzas: `Sos el Agente de Cobranzas de una demo de portfolio (sistema multi-agente diseñado por Bautista Carrera, AI Developer). En un caso real, revisarías vencimientos, enviarías recordatorios de pago y conciliarías pagos contra facturas pendientes, conectado al sistema contable de la empresa.

Conocimiento que aplicás como experto en cobranzas:
- Escalamiento de gestión de cobro por antigüedad de mora: recordatorio amable (0-15 días de vencida), aviso más firme con detalle de intereses (15-30 días), intimación formal (30-60 días), pase a gestión legal/corte de servicio (60+ días) — siempre elegís el tono según cuántos días de atraso hay.
- Conciliación: para dar un pago por aplicado necesitás fecha, monto, medio de pago y comprobante/referencia — sin eso, el pago queda "a confirmar".
- Mantenés buena relación comercial: la gestión de cobro es firme pero nunca agresiva, porque el cliente sigue siendo cliente.

Como esto es una demo sin backend real, simulá el rol de forma creíble, aclarando que en producción esto se conecta a un ERP real.
${SHARED_PROTOCOL}`,

  soporte: `Sos el Agente de Soporte de una demo de portfolio (sistema multi-agente diseñado por Bautista Carrera, AI Developer). Está inspirado en un proyecto real y en producción de Bautista: un equipo de agentes que automatiza la atención de soporte técnico. Un primer agente recibe al cliente por WhatsApp, lo identifica y abre el ticket; un segundo agente hace el diagnóstico técnico avanzado sobre el sistema real (accediendo por SSH al servidor/VPS cuando hace falta) y deja notas internas con lo que encontró, antes de que el equipo humano intervenga. Esto acelera la resolución y descarga al equipo humano de los casos repetitivos.

Conocimiento que aplicás como experto en soporte técnico:
- Triage por severidad: crítico (sistema caído / afecta a todos los usuarios, resolución inmediata), alto (afecta una función importante, resolución en horas), medio (molesto pero con solución alternativa, resolución en 1-2 días), bajo (consulta o mejora, se agenda).
- Antes de escalar, pedís los datos mínimos para reproducir el problema: qué estaba haciendo el usuario, qué esperaba que pase, qué pasó en realidad, y si es reproducible.
- Si el caso lo amerita, podés simular una revisión técnica directa sobre el servidor (logs, procesos, estado del servicio) antes de responder — no solo derivás a ciegas.
- Cuando escalás a una persona del equipo, armás un resumen claro del caso con el diagnóstico ya hecho (no solo reenviás el mensaje del usuario), dejando nota interna en el ticket.
- Si te preguntan cómo funciona el sistema completo, podés explicar el flujo real: primer contacto y apertura de ticket por WhatsApp → diagnóstico técnico sobre el sistema (incluyendo acceso al servidor si hace falta) → nota interna con hallazgos → resolución directa o escalamiento con contexto ya armado.

Como esto es una demo sin backend real conectado, respondé de forma útil y creíble simulando ese rol, hablando en términos generales del ticket y el sistema (sin inventar nombres de terceros salvo WhatsApp/SSH que sí son parte real del sistema).
${SHARED_PROTOCOL}`,

  administracion: `Sos el Agente de Administración de una demo de portfolio (sistema multi-agente diseñado por Bautista Carrera, AI Developer). En un caso real, gestionarías órdenes de compra, legajos y trámites internos integrados a las herramientas de la empresa. También está inspirado en otro proyecto real de Bautista: un agente que automatiza la bandeja de entrada de correo de un directivo — sincroniza, clasifica y prioriza los mails automáticamente, los resume, y redacta borradores de respuesta con contexto del negocio listos para que la persona los revise y apruebe (nunca envía un mail solo). Es parte de un equipo de agentes más amplio que además carga información y genera reportes.

Conocimiento que aplicás como experto en administración/compras:
- Alta de proveedor nuevo: razón social, CUIT, condición frente al IVA, domicilio fiscal y datos bancarios para pago — sin eso no se puede dar de alta ni pagar después.
- Orden de compra: siempre lleva ítems con cantidad y precio unitario, plazo de entrega esperado, y a partir de cierto monto requiere aprobación de un responsable antes de emitirse (no la emitís vos solo si supera el límite habitual).
- Trámites internos (legajos, altas de personal, licencias): explicás qué documentación se necesita y en qué orden, para no ir y volver innecesariamente.
- Gestión de correo: clasificás por urgencia y tema (comercial, interno, spam/newsletter, requiere acción), redactás un resumen breve por mail largo, y armás un borrador de respuesta con el tono y contexto adecuado — pero nunca lo enviás sin que la persona lo revise y confirme.
- Si te preguntan cómo funciona el sistema de correo, podés explicarlo: sincronización de la bandeja → clasificación y priorización automática → resumen de cada mail relevante → borrador de respuesta con contexto del negocio → espera de aprobación humana antes de enviar.

Como esto es una demo sin backend real, simulá el rol de forma creíble, en términos generales sobre "el sistema interno de la empresa".
${SHARED_PROTOCOL}`,

  contabilidad: `Sos el Agente de Contabilidad de una demo de portfolio (sistema multi-agente diseñado por Bautista Carrera, AI Developer). Está inspirado en un proyecto real y en producción de Bautista: un agente que recibe facturas y comprobantes de proveedores por chat, los lee con visión (extrayendo tipo de comprobante, fecha, proveedor, CUIT, punto de venta, número, neto gravado, IVA, impuestos internos, total y CAE), valida esos datos con el usuario antes de actuar, pregunta si el gasto es personal o de la empresa y si es recurrente, y si es recurrente y de la empresa propone vincularlo a una orden de compra proyectada. Después sugiere la cuenta contable de imputación y, recién con confirmación humana, carga la factura en Odoo como borrador para que alguien la revise.

Conocimiento que aplicás como experto contable/impositivo argentino:
- Tipos de comprobante: Factura A (entre responsables inscriptos, discrimina IVA), Factura B (a consumidor final o monotributista, no discrimina IVA), Factura C (emitida por monotributistas).
- Cálculo de IVA 21% sobre un total: Neto = Total / 1.21, IVA = Total − Neto. Si te dan un monto total, hacés ese cálculo real y se lo mostrás al usuario.
- Nunca cargás nada sin la confirmación del usuario: mostrás lo que interpretaste (o calculaste) y preguntás si es correcto antes de dar el paso siguiente.
- Si te preguntan cómo funciona el proceso completo, podés explicar el flujo real: captura del comprobante → lectura con visión → validación con el usuario → clasificación (personal/empresa, recurrente o no) → vinculación a orden de compra si corresponde → sugerencia de cuenta contable → carga en Odoo como borrador.

Como esto es una demo sin Odoo conectado de verdad, simulá el flujo de forma creíble, mostrando cálculos reales cuando el usuario te da montos.
${SHARED_PROTOCOL}`,
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Última red de seguridad: si Gemini, los modelos gratis y el de pago de
// OpenRouter fallan todos a la vez (poco probable, pero servicios gratuitos
// de terceros no garantizan 100% uptime), respondemos con esto en vez de
// un error crudo, para que el chat nunca se sienta "roto".
const LAST_RESORT_REPLIES: Record<AgentId, string> = {
  orquestador:
    "Los proveedores de IA gratuitos que uso para esta demo están saturados justo ahora (pasa de vez en cuando con las capas gratuitas). Probá de nuevo en unos segundos, normalmente se resuelve solo.",
  ventas:
    "Se saturó momentáneamente el modelo detrás de esta demo. Dame unos segundos y reintentá — mientras tanto, contame igual qué necesitás cotizar.",
  cobranzas:
    "El modelo de IA de esta demo está con alta demanda en este momento. Reintentá en unos segundos, por favor.",
  soporte:
    "Justo ahora los proveedores gratuitos de IA de esta demo están saturados — es transitorio. Probá de nuevo en breve.",
  administracion:
    "La IA de esta demo está temporalmente saturada. Reintentá en unos segundos.",
  contabilidad:
    "El modelo está con alta demanda en este momento (pasa con las capas gratuitas). Probá de nuevo en unos segundos.",
};

// Los modelos a veces ponen las etiquetas en cualquier lado del texto, así que
// se buscan en todo el mensaje y se quitan siempre, para que nunca se filtren
// al usuario. Se usa la última etiqueta de handoff y la primera de acción.
function extractHandoff(raw: string): { content: string; handoff: string | null } {
  const matches = [...raw.matchAll(/\[\[HANDOFF:\s*(\w+)\s*\]\]/g)];
  const handoff = matches.length ? matches[matches.length - 1][1] : null;
  const content = raw.replace(/\s*\[\[HANDOFF:[^\]]*\]\]/g, "").trim();
  return { content, handoff };
}

function extractAction(raw: string): { content: string; action: string | null } {
  const actionMatch = raw.match(/\[\[ACTION:([^\]]+)\]\]/);
  const action = actionMatch ? actionMatch[1].trim() : null;
  const content = raw.replace(/\s*\[\[ACTION:[^\]]*\]\]\s*/g, " ").trim();
  return { content, action };
}

async function tryGemini(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY no configurada");

  const ai = new GoogleGenAI({ apiKey });

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Presupuesto total de Gemini: cada modelo se prueba mientras quede tiempo.
  const startedAt = Date.now();
  let lastErr: unknown = null;

  for (const model of GEMINI_MODELS) {
    const remaining = GEMINI_TIMEOUT_MS - (Date.now() - startedAt);
    if (remaining < 1_500) break;
    if ((geminiCooldown.get(model) ?? 0) > Date.now()) continue;

    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
          maxOutputTokens: 700,
          abortSignal: AbortSignal.timeout(remaining),
          // Gemini 3.x no soporta desactivar el thinking del todo
          // (thinkingBudget no aplica en esta familia); "low" minimiza el
          // consumo de tokens de razonamiento para dejar presupuesto real
          // para la respuesta.
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const text = response.text?.trim();
      if (!text) throw new Error("Respuesta vacía de Gemini");
      return text;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      // Cuota agotada (diaria o por minuto): no se reintenta, se pasa al
      // siguiente modelo y este se saltea un rato.
      if (/429|RESOURCE_EXHAUSTED/i.test(msg)) {
        geminiCooldown.set(model, Date.now() + GEMINI_COOLDOWN_MS);
      }
      console.warn(`Gemini modelo "${model}" falló, probando siguiente:`, err);
    }
  }
  throw lastErr ?? new Error("Gemini sin modelos disponibles (cuota agotada)");
}

async function callOpenRouter(
  model: string,
  systemPrompt: string,
  messages: ChatMessage[],
  timeoutMs: number
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurada");

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.6,
      max_tokens: 400,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`OpenRouter (${model}) error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error(`Respuesta vacía de OpenRouter (${model})`);
  return text;
}

// Cascada de modelos gratuitos.
async function tryOpenRouterFree(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  let lastErr: unknown = null;
  const startedAt = Date.now();

  for (const model of OPENROUTER_FALLBACK_MODELS) {
    if (Date.now() - startedAt > FREE_TOTAL_BUDGET_MS) break;
    try {
      return await callOpenRouter(model, systemPrompt, messages, FREE_TIMEOUT_MS);
    } catch (err) {
      lastErr = err;
      console.warn(`Fallback OpenRouter modelo "${model}" falló, probando siguiente:`, err);
    }
  }

  throw lastErr ?? new Error("Todos los modelos gratuitos de OpenRouter fallaron");
}

// Categoría corta del error, para diagnóstico (sin datos sensibles).
function failureCategory(err: unknown): string {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  if (/no configurada/i.test(msg)) return "no-key";
  if (/abort|timeout/i.test(msg)) return "timeout";
  if (/429|RESOURCE_EXHAUSTED/i.test(msg)) return "429";
  if (/503|UNAVAILABLE/i.test(msg)) return "503";
  if (/403|PERMISSION_DENIED|location/i.test(msg)) return "403";
  if (/401|API key|UNAUTHENTICATED/i.test(msg)) return "401";
  if (/400|FAILED_PRECONDITION|INVALID_ARGUMENT/i.test(msg)) return "400";
  if (/vac[ií]a/i.test(msg)) return "empty";
  return "error";
}

const AGENT_IDS = Object.keys(SYSTEM_PROMPTS) as AgentId[];
const MAX_MESSAGES = 10;
const MAX_MESSAGE_CHARS = 1000;
const MAX_CONTEXT_CHARS = 2000;

// Rate limit en memoria por IP. En serverless cada instancia tiene su propio
// contador, así que es una protección de mejor esfuerzo contra abuso de la
// cuota gratuita, no un límite estricto.
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [key, v] of hits) if (v.resetAt <= now) hits.delete(key);
  }
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function parseMessages(raw: unknown): ChatMessage[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const parsed: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (
      !m ||
      typeof m !== "object" ||
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      !m.content.trim()
    ) {
      return null;
    }
    parsed.push({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) });
  }
  // Gemini y OpenRouter esperan que la conversación termine con un mensaje del usuario.
  return parsed[parsed.length - 1].role === "user" ? parsed : null;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Demasiados mensajes, esperá un minuto e intentá de nuevo." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Body inválido" }, { status: 400 });
    }
    const input = body as Record<string, unknown>;

    const agentId: AgentId = AGENT_IDS.includes(input.agentId as AgentId)
      ? (input.agentId as AgentId)
      : "orquestador";
    const messages = parseMessages(input.messages);
    // Resumen breve de contexto acumulado en la conversación (ej: datos que
    // el usuario ya dio en otro agente), para que el nuevo agente no repita
    // preguntas ya respondidas.
    const contextSummary =
      typeof input.contextSummary === "string"
        ? input.contextSummary.slice(-MAX_CONTEXT_CHARS) // lo más reciente
        : undefined;

    if (!messages) {
      return NextResponse.json({ error: "messages inválido" }, { status: 400 });
    }

    let systemPrompt = SYSTEM_PROMPTS[agentId];
    if (contextSummary) {
      systemPrompt += `\n\nContexto previo de esta conversación (datos que el usuario ya mencionó, no se los vuelvas a pedir si ya los tenés): ${contextSummary}`;
    }

    let raw: string | null = null;
    let lastError: unknown = null;
    // Diagnóstico: quién respondió y por qué falló Gemini (headers de respuesta).
    let provider = "none";
    let geminiFail: string | null = null;

    // 1) Intento primario: Gemini (capa gratuita con cuotas diarias chicas por modelo).
    try {
      raw = await tryGemini(systemPrompt, messages);
      provider = "gemini";
    } catch (err) {
      lastError = err;
      geminiFail = failureCategory(err);
      console.warn("Gemini falló, probando fallback OpenRouter:", err);
    }

    // 2) Fallback: cascada de modelos gratuitos de OpenRouter.
    if (!raw) {
      try {
        raw = await tryOpenRouterFree(systemPrompt, messages);
        provider = "openrouter-free";
      } catch (err) {
        lastError = err;
        console.warn("Modelos gratuitos de OpenRouter fallaron, probando el de pago:", err);
      }
    }

    // 3) Último escalón: modelo barato de pago, con su propio tiempo garantizado.
    if (!raw) {
      try {
        raw = await callOpenRouter(PAID_FALLBACK_MODEL, systemPrompt, messages, PAID_TIMEOUT_MS);
        provider = "openrouter-paid";
      } catch (err) {
        lastError = err;
        console.error("El modelo de pago también falló:", err);
      }
    }

    const headers: Record<string, string> = { "x-provider": provider };
    if (geminiFail) headers["x-gemini-fail"] = geminiFail;

    if (!raw) {
      console.error("Todos los proveedores fallaron:", lastError);
      const fallbackReply = LAST_RESORT_REPLIES[agentId];
      return NextResponse.json(
        { content: fallbackReply, handoff: null, action: null },
        { headers }
      );
    }

    const { content: withoutHandoff, handoff } = extractHandoff(raw);
    const { content, action } = extractAction(withoutHandoff);
    return NextResponse.json({ content, handoff, action }, { headers });
  } catch (err) {
    console.error("assistant api error", err);
    return NextResponse.json(
      { error: "Error al generar la respuesta." },
      { status: 500 }
    );
  }
}
