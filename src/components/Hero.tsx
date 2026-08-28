"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, Terminal } from "lucide-react";
import AgentNetwork from "./AgentNetwork";

export default function Hero() {
  return (
    <section
      id="top"
      className="grid-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-20"
    >
      <AgentNetwork />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[var(--background)]/40 to-[var(--background)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <div className="mb-6 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)]/80 px-4 py-1.5 font-mono-code text-xs text-[var(--muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] pulse-node" />
          <Terminal size={12} className="text-[var(--accent)]" />
          Available for new opportunities
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Bautista <span className="text-gradient">Carrera</span>
        </h1>

        <p className="mt-3 font-mono-code text-sm text-[var(--accent)] sm:text-base">
          AI Developer
        </p>

        <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-[var(--muted)] sm:text-lg">
          Desarrollador de IA enfocado en sistemas de agentes autónomos — diseño,
          construyo y despliego soluciones que integran modelos de lenguaje con
          herramientas reales.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#projects"
            className="rounded-full bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-[#05070d] transition-transform hover:scale-105"
          >
            Ver proyectos
          </a>
          <a
            href="#assistant"
            className="rounded-full border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
          >
            Hablar con mi asistente
          </a>
          <a
            href="/Bautista-Carrera-CV.pdf"
            download
            className="flex items-center gap-2 rounded-full border border-[var(--border)] px-6 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
          >
            <Download size={14} />
            Descargar CV
          </a>
        </div>
      </motion.div>

      <motion.a
        href="#skills"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
      >
        <span className="font-mono-code text-[10px] uppercase tracking-widest">
          scroll
        </span>
        <ArrowDown size={16} className="animate-bounce" />
      </motion.a>
    </section>
  );
}
