"use client";

import { motion } from "framer-motion";

const items = [
  {
    period: "2025 — Presente",
    role: "AI Developer",
    org: "Hitofusion",
    desc: "Diseño y desarrollo de agentes de IA autónomos para automatizar tareas y flujos de trabajo. Integración de modelos y lógica de agentes inteligentes en productos de software, siguiendo buenas prácticas de desarrollo.",
  },
  {
    period: "En curso",
    role: "Tecnicatura Superior en Ciencia de Datos e Inteligencia Artificial",
    org: "ISTEA",
    desc: "Formación en ciencia de datos, machine learning y fundamentos de inteligencia artificial.",
  },
  {
    period: "En curso",
    role: "QA Manager",
    org: "EducaciónIT",
    desc: "Formación en gestión y liderazgo de calidad de software: estrategias de testing, procesos de QA y buenas prácticas de aseguramiento de calidad.",
  },
  {
    period: "Completado",
    role: "Desarrollo Web Full Stack",
    org: "IAC Quilmes",
    desc: "Formación full stack: desarrollo de aplicaciones web de punta a punta, frontend y backend.",
  },
  {
    period: "Completado",
    role: "Programación C# .NET",
    org: "IAC Quilmes",
    desc: "Formación en programación orientada a objetos y desarrollo de aplicaciones con C# y .NET.",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
          /experience
        </p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Trayectoria</h2>
      </motion.div>

      <div className="mt-12 space-y-6 border-l border-[var(--border)] pl-8">
        {items.map((it, i) => (
          <motion.div
            key={it.role}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative"
          >
            <span className="absolute -left-[2.35rem] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            <p className="font-mono-code text-xs text-[var(--muted)]">
              {it.period}
            </p>
            <h3 className="mt-1 text-lg font-semibold">
              {it.role}{" "}
              <span className="text-[var(--muted)]">— {it.org}</span>
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
              {it.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
