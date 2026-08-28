"use client";

import { motion } from "framer-motion";
import { Bot, Eye, Languages, ServerCog, ShieldCheck, Workflow } from "lucide-react";

const groups = [
  {
    icon: Bot,
    title: "IA, Agentes & LLMs",
    items: [
      "Sistemas multi-agente",
      "Arquitecturas con orquestador",
      "RAG & bases de datos vectoriales",
      "Model Context Protocol (MCP)",
      "Tool use & memoria a largo plazo",
      "Claude · GPT · Gemini · DeepSeek · Kimi",
    ],
  },
  {
    icon: Workflow,
    title: "Automatización & Orquestación",
    items: [
      "Automatización de procesos de negocio",
      "OpenClaw",
      "Hermes",
      "Buzz Agents",
      "Integraciones con ERP / CRM (Odoo)",
      "APIs & webhooks",
      "Tareas programadas",
    ],
  },
  {
    icon: Eye,
    title: "Visión & Datos no estructurados",
    items: [
      "Computer vision",
      "Detección de objetos",
      "OCR de documentos",
      "Transcripción de audio",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Infraestructura, Deploy & Seguridad",
    items: [
      "Docker",
      "Linux / VPS",
      "Plataformas de despliegue",
      "Control de accesos",
      "Audit logs & manejo de secretos",
    ],
  },
  {
    icon: ServerCog,
    title: "Backend & Frontend",
    items: [
      "Python · Node.js · TypeScript",
      "APIs REST",
      "PostgreSQL · Supabase",
      "React · Next.js",
    ],
  },
];

const languages = [
  { name: "Español", level: "Nativo", fill: 100 },
  { name: "Inglés", level: "Básico", fill: 35 },
];

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
          /skills
        </p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Stack técnico
        </h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Herramientas y tecnologías con las que diseño, construyo y despliego.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g, i) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <g.icon size={18} />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{g.title}</h3>
            <ul className="mt-4 space-y-2">
              {g.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-[var(--muted)]"
                >
                  <span className="h-1 w-1 rounded-full bg-[var(--accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Languages size={18} />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Idiomas</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {languages.map((lang) => (
            <div key={lang.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{lang.name}</span>
                <span className="font-mono-code text-xs text-[var(--muted)]">
                  {lang.level}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--background)]">
                <div
                  className="h-full rounded-full bg-[var(--accent)]"
                  style={{ width: `${lang.fill}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
