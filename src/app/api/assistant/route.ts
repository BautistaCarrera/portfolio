import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GEMINI_MODEL = "gemini-3.6-flash";
// Cadena de modelos 100% gratuitos en OpenRouter, probados en orden como
// fallback si Gemini falla (rate limit, timeout, error de red, etc.).
// Los modelos gratis de OpenRouter son de pool compartido entre todos los
// usuarios y se saturan seguido — por eso probamos varios de proveedores
// distintos en cascada, para bajar la chance de que todos estén caídos
// al mismo tiempo.
const OPENROUTER_FALLBACK_MODELS = [
  "google/gemma-4-31b-it:free",
  "z-ai/glm-5.2:free",
  "minimax/minimax-m2.7:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "minimax/minimax-m3:free",
  "google/gemma-4-26b-a4b-it:free",
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

// Última red de seguridad: si Gemini y los 6 modelos de fallback de
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

function extractHandoff(raw: string): { content: string; handoff: string | null } {
  const handoffMatch = raw.match(/\[\[HANDOFF:(\w+)\]\]\s*$/);
  const handoff = handoffMatch ? handoffMatch[1] : null;
  const content = raw.replace(/\[\[HANDOFF:\w+\]\]\s*$/, "").trim();
  return { content, handoff };
}

function extractAction(raw: string): { content: string; action: string | null } {
  const actionMatch = raw.match(/^\s*\[\[ACTION:([^\]]+)\]\]\s*/);
  const action = actionMatch ? actionMatch[1].trim() : null;
  const content = raw.replace(/^\s*\[\[ACTION:[^\]]+\]\]\s*/, "").trim();
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

  // Reintento corto en caso de 429 (rate limit) transitorio: la capa
  // gratuita de Gemini limita requests por minuto, y a veces se libera
  // en un par de segundos.
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6,
          maxOutputTokens: 700,
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
      const isRateLimit = err instanceof Error && /429|RESOURCE_EXHAUSTED/i.test(err.message);
      if (isRateLimit && attempt === 0) {
        await new Promise((r) => setTimeout(r, 1200));
        continue;
      }
      break;
    }
  }
  throw lastErr ?? new Error("Gemini falló");
}

async function tryOpenRouter(systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY no configurada");

  let lastErr: unknown = null;

  for (const model of OPENROUTER_FALLBACK_MODELS) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
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
    } catch (err) {
      lastErr = err;
      console.warn(`Fallback OpenRouter modelo "${model}" falló, probando siguiente:`, err);
    }
  }

  throw lastErr ?? new Error("Todos los modelos de fallback de OpenRouter fallaron");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agentId: AgentId = body.agentId ?? "orquestador";
    const messages: ChatMessage[] = body.messages ?? [];
    // Resumen breve de contexto acumulado en la conversación (ej: datos que
    // el usuario ya dio en otro agente), para que el nuevo agente no repita
    // preguntas ya respondidas.
    const contextSummary: string | undefined = body.contextSummary;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages requerido" }, { status: 400 });
    }

    let systemPrompt = SYSTEM_PROMPTS[agentId] ?? SYSTEM_PROMPTS.orquestador;
    if (contextSummary) {
      systemPrompt += `\n\nContexto previo de esta conversación (datos que el usuario ya mencionó, no se los vuelvas a pedir si ya los tenés): ${contextSummary}`;
    }

    const recentMessages = messages.slice(-10);

    let raw: string | null = null;
    let lastError: unknown = null;

    // 1) Intento primario: Gemini (capa gratuita generosa, sin tarjeta).
    try {
      raw = await tryGemini(systemPrompt, recentMessages);
    } catch (err) {
      lastError = err;
      console.warn("Gemini falló, probando fallback OpenRouter:", err);
    }

    // 2) Fallback automático: OpenRouter (modelo gratuito), si Gemini falla
    //    por rate limit, timeout, falta de key, etc.
    if (!raw) {
      try {
        raw = await tryOpenRouter(systemPrompt, recentMessages);
      } catch (err) {
        lastError = err;
        console.error("OpenRouter también falló:", err);
      }
    }

    if (!raw) {
      console.error("Ambos proveedores fallaron:", lastError);
      const fallbackReply = LAST_RESORT_REPLIES[agentId] ?? LAST_RESORT_REPLIES.orquestador;
      return NextResponse.json({ content: fallbackReply, handoff: null, action: null });
    }

    const { content: withoutHandoff, handoff } = extractHandoff(raw);
    const { content, action } = extractAction(withoutHandoff);
    return NextResponse.json({ content, handoff, action });
  } catch (err) {
    console.error("assistant api error", err);
    return NextResponse.json(
      { error: "Error al generar la respuesta." },
      { status: 500 }
    );
  }
}
