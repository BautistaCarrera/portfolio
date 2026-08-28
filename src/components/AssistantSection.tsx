"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import AIAssistant from "./AIAssistant";

export default function AssistantSection() {
  return (
    <section id="assistant" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
          /assistant
        </p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Arquitectura de agentes, en vivo
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--muted)]">
          Un orquestador que deriva cada consulta al agente especializado
          correcto — con IA real, no respuestas guionadas. Probalo vos mismo.
        </p>
        <p className="mx-auto mt-3 flex max-w-lg items-center justify-center gap-1.5 font-mono-code text-[11px] text-[var(--muted)]">
          <Clock size={11} />
          Corre sobre modelos gratuitos — puede tardar unos segundos en
          responder.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <AIAssistant />
      </motion.div>
    </section>
  );
}
