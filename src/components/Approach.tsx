"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CreditCard,
  Headphones,
  Landmark,
  ShoppingCart,
  Wallet,
} from "lucide-react";

const agents = [
  { label: "Ventas", icon: ShoppingCart },
  { label: "Cobranzas", icon: Wallet },
  { label: "Soporte", icon: Headphones },
  { label: "Administración", icon: Landmark },
  { label: "Contabilidad", icon: CreditCard },
];

export default function Approach() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
            /approach
          </p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Mi enfoque
          </h2>
          <p className="mt-5 text-lg font-medium text-[var(--foreground)]">
            Automatizo procesos enteros, no bots aislados.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">
            En vez de armar un asistente suelto para cada necesidad, diseño
            equipos de agentes que se reparten el trabajo entre sí: un
            orquestador central recibe cada tarea y la deriva al agente
            especializado en esa área —ventas, cobranzas, soporte,
            administración— y cada uno opera conectado a las herramientas que
            la empresa ya usa día a día.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">
            Eso es lo que muestra el esquema: la tarea entra por un solo
            punto, el orquestador decide quién la resuelve, y el trabajo
            fluye hacia el agente correcto. Sumar una nueva área es agregar
            un carril más — no reescribir el sistema entero.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)]/50 p-6 sm:p-8"
        >
          {/* Entrada de tarea */}
          <div className="flex justify-center">
            <div className="rounded-full border border-[var(--border)] bg-[var(--background-alt)] px-4 py-1.5 font-mono-code text-[11px] text-[var(--muted)]">
              tarea entrante
            </div>
          </div>

          {/* Línea hacia el orquestador */}
          <div className="mx-auto my-3 h-8 w-px bg-gradient-to-b from-[var(--border)] to-[var(--accent)]/50" />

          {/* Orquestador */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)] shadow-lg shadow-[var(--accent)]/10">
                <Bot size={22} className="pulse-node" />
              </div>
              <span className="font-mono-code text-[11px] text-[var(--foreground)]">
                Orquestador
              </span>
            </div>
          </div>

          {/* Carriles hacia cada agente */}
          <div className="relative mt-8">
            <svg
              viewBox="0 0 600 60"
              preserveAspectRatio="none"
              className="absolute -top-8 left-0 h-8 w-full"
              aria-hidden="true"
            >
              {agents.map((_, i) => {
                const targetX = (600 / (agents.length - 1)) * i;
                return (
                  <path
                    key={i}
                    d={`M 300 0 C 300 30, ${targetX} 30, ${targetX} 60`}
                    fill="none"
                    stroke="var(--accent)"
                    strokeOpacity={0.3}
                    strokeWidth={1.2}
                  />
                );
              })}
            </svg>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {agents.map((a, i) => (
                <motion.div
                  key={a.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                  className="flex flex-col items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background-alt)] px-3 py-4 text-center"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-2)]/10 text-[var(--accent-2)]">
                    <a.icon size={16} />
                  </div>
                  <span className="font-mono-code text-[10px] leading-tight text-[var(--muted)]">
                    {a.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
