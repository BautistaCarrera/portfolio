"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CreditCard,
  Headphones,
  Landmark,
  Loader2,
  Send,
  ShoppingCart,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";

type AgentId =
  | "orquestador"
  | "ventas"
  | "cobranzas"
  | "soporte"
  | "administracion"
  | "contabilidad";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  agentId?: AgentId;
  link?: { href: string; label: string };
  action?: string;
}

interface AgentDef {
  id: AgentId;
  name: string;
  icon: typeof Bot;
  greeting: string;
}

const AGENTS: Record<AgentId, AgentDef> = {
  orquestador: {
    id: "orquestador",
    name: "Orquestador",
    icon: Bot,
    greeting:
      "Hola, soy el orquestador de esta demo (con IA real conectada). Preguntame sobre stack, experiencia o proyectos — y si el tema es de ventas, cobranzas, soporte, administración o contabilidad, te derivo al agente especializado.",
  },
  ventas: {
    id: "ventas",
    name: "Agente de Ventas",
    icon: ShoppingCart,
    greeting:
      "Hola, soy el agente de Ventas. Puedo cotizar productos, armar propuestas y hacer seguimiento de leads conectado al CRM de la empresa.",
  },
  cobranzas: {
    id: "cobranzas",
    name: "Agente de Cobranzas",
    icon: Wallet,
    greeting:
      "Hola, soy el agente de Cobranzas. Reviso vencimientos, envío recordatorios de pago y concilio pagos recibidos contra facturas pendientes.",
  },
  soporte: {
    id: "soporte",
    name: "Agente de Soporte",
    icon: Headphones,
    greeting:
      "Hola, soy el agente de Soporte. Resuelvo consultas frecuentes y, si el caso lo requiere, escalo a una persona del equipo con todo el contexto ya armado.",
  },
  administracion: {
    id: "administracion",
    name: "Agente de Administración",
    icon: Landmark,
    greeting:
      "Hola, soy el agente de Administración. Gestiono órdenes de compra, legajos y trámites internos, todo integrado a las herramientas que ya usa la empresa.",
  },
  contabilidad: {
    id: "contabilidad",
    name: "Agente de Contabilidad",
    icon: CreditCard,
    greeting:
      "Hola, soy el agente de Contabilidad. Cargo comprobantes, imputo cuentas y dejo todo listo en Odoo para el cierre contable — con revisión humana en cada paso.",
  },
};

// Links contextuales que se muestran cuando la respuesta del orquestador
// menciona ciertos temas (heurística simple sobre el texto generado).
function detectLink(text: string): { href: string; label: string } | undefined {
  const lower = text.toLowerCase();
  if (lower.includes("stack") || lower.includes("tecnológ")) {
    return { href: "#skills", label: "Ver stack completo" };
  }
  if (lower.includes("proyecto") || lower.includes("odoo") || lower.includes("factura")) {
    return { href: "#projects", label: "Ver el case study" };
  }
  if (lower.includes("hitofusion") || lower.includes("experiencia")) {
    return { href: "#experience", label: "Ver trayectoria" };
  }
  if (lower.includes("contacto") || lower.includes("linkedin") || lower.includes("email")) {
    return { href: "#contact", label: "Ir a contacto" };
  }
  if (lower.includes("enfoque") || lower.includes("orquestador central")) {
    return { href: "#approach", label: "Ver mi enfoque" };
  }
  return undefined;
}

const SUGGESTIONS_BY_AGENT: Record<AgentId, string[]> = {
  orquestador: ["¿Qué stack usás?", "Necesito ayuda con una cotización", "Tengo un problema técnico"],
  ventas: ["Quiero cotizar un producto", "¿Cómo hacen seguimiento de leads?", "Volver al orquestador"],
  cobranzas: ["Tengo una factura vencida", "¿Cómo concilian pagos?", "Volver al orquestador"],
  soporte: ["Tengo un error en el sistema", "¿Cómo escalan un caso?", "Volver al orquestador"],
  administracion: ["Necesito una orden de compra", "¿Cómo gestionan trámites?", "Volver al orquestador"],
  contabilidad: ["Tengo un comprobante para cargar", "¿Qué cuenta contable usarías?", "Volver al orquestador"],
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", agentId: "orquestador", content: AGENTS.orquestador.greeting },
  ]);
  const [activeAgent, setActiveAgent] = useState<AgentId>("orquestador");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setTyping(true);
    setErrorMsg(null);

    // Contexto acumulado: lo que el usuario fue contando en la conversación,
    // para que si lo deriva a otro agente no tenga que repetir todo de cero.
    const contextSummary = history
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" | ");

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: activeAgent,
          contextSummary,
          messages: history
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error del servidor");
      }

      const data: { content: string; handoff: AgentId | null; action: string | null } =
        await res.json();

      if (data.handoff && data.handoff !== activeAgent && AGENTS[data.handoff]) {
        const targetAgent = AGENTS[data.handoff];
        setMessages((m) => [
          ...m,
          ...(data.content
            ? [{ role: "assistant" as const, agentId: activeAgent, content: data.content, action: data.action ?? undefined }]
            : []),
          { role: "system", content: `Derivando a ${targetAgent.name}…` },
        ]);
        setTimeout(() => {
          setActiveAgent(data.handoff as AgentId);
          setMessages((m) => [
            ...m,
            { role: "assistant", agentId: data.handoff as AgentId, content: targetAgent.greeting },
          ]);
          setTyping(false);
          inputRef.current?.focus({ preventScroll: true });
        }, 700);
        return;
      }

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          agentId: activeAgent,
          content: data.content,
          link: detectLink(data.content),
          action: data.action ?? undefined,
        },
      ]);
      setTyping(false);
      inputRef.current?.focus({ preventScroll: true });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el asistente. Probá de nuevo en un momento."
      );
      setTyping(false);
      inputRef.current?.focus({ preventScroll: true });
    }
  }

  function goTo(href: string) {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  }

  const activeDef = AGENTS[activeAgent];
  const suggestions = SUGGESTIONS_BY_AGENT[activeAgent];

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/70 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[var(--background-alt)] px-4 py-3">
        <Sparkles size={14} className="text-[var(--accent)]" />
        <span className="font-mono-code text-xs text-[var(--muted)]">
          {activeAgent === "orquestador" ? "Orquestador" : `Orquestador → ${activeDef.name}`}
        </span>
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)] pulse-node" />
      </div>

      <div className="flex h-96 flex-col gap-4 overflow-y-auto px-4 py-5">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            if (m.role === "system") {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-2 py-1"
                >
                  <span className="h-px w-6 bg-[var(--border)]" />
                  <span className="font-mono-code text-[10px] uppercase tracking-widest text-[var(--accent)]">
                    {m.content}
                  </span>
                  <span className="h-px w-6 bg-[var(--border)]" />
                </motion.div>
              );
            }

            const agentDef = m.agentId ? AGENTS[m.agentId] : null;
            const AgentIcon = agentDef?.icon ?? Bot;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2.5 ${
                  m.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    m.role === "assistant"
                      ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                      : "bg-[var(--accent-2)]/15 text-[var(--accent-2)]"
                  }`}
                >
                  {m.role === "assistant" ? <AgentIcon size={14} /> : <User size={14} />}
                </div>
                <div
                  className={`flex max-w-[80%] flex-col gap-1.5 ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  {m.role === "assistant" && agentDef && (
                    <span className="font-mono-code text-[10px] text-[var(--muted)]">
                      {agentDef.name}
                    </span>
                  )}
                  {m.action && (
                    <span className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 font-mono-code text-[10px] text-[var(--accent)]">
                      <Loader2 size={10} className="animate-spin" />
                      {m.action}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "assistant"
                        ? "rounded-tl-sm bg-[var(--background-alt)] text-[var(--foreground)]"
                        : "rounded-tr-sm bg-[var(--accent-2)]/10 text-[var(--foreground)]"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.link && (
                    <button
                      onClick={() => goTo(m.link!.href)}
                      className="flex items-center gap-1 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-3 py-1.5 font-mono-code text-[11px] text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/15"
                    >
                      {m.link.label}
                      <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {typing && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
              <Bot size={14} />
            </div>
            <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-[var(--background-alt)] px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)]"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-[var(--border)] px-4 py-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-[var(--border)] px-3 py-1 font-mono-code text-[11px] text-[var(--muted)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            id="assistant-chat-input"
            name="message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              activeAgent === "orquestador"
                ? "Escribí un mensaje..."
                : `Escribile a ${activeDef.name}...`
            }
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]/50"
          />
          <button
            type="submit"
            aria-label="Enviar"
            disabled={typing}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[#05070d] transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
