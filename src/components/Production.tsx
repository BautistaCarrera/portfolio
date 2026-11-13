"use client";

import { motion } from "framer-motion";
import {
  FlaskConical,
  KeyRound,
  Layers,
  ShieldCheck,
  UserCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const practices: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: UserCheck,
    title: "Control humano en cada paso crítico",
    desc: "Los agentes preparan el trabajo, pero nada se carga, se envía o se escala sin confirmación. La decisión final es siempre de una persona.",
  },
  {
    icon: ShieldCheck,
    title: "Validación antes de actuar",
    desc: "El agente muestra lo que interpretó (por ejemplo, los datos de una factura) y espera confirmación antes de tocar el sistema real.",
  },
  {
    icon: KeyRound,
    title: "Accesos, secretos y registro",
    desc: "Control de accesos, manejo de secretos y audit logs desde el diseño, no como parche al final.",
  },
  {
    icon: Layers,
    title: "Tolerancia a fallos",
    desc: "Este mismo asistente encadena proveedores (Gemini, modelos gratuitos y uno económico de pago), con timeouts por escalón y un mensaje de respaldo si todo falla.",
  },
  {
    icon: Wallet,
    title: "Costo bajo control",
    desc: "Rate limit, límites de tamaño por mensaje y elección del modelo según el costo por consulta. La API valida el origen y sanea el contexto contra inyección de prompts.",
  },
  {
    icon: FlaskConical,
    title: "Pruebas antes de desplegar",
    desc: "Pruebo cada agente en local con casos de uso antes de llevarlo a producción.",
  },
];

export default function Production() {
  return (
    <section
      id="production"
      className="scroll-mt-16 mx-auto max-w-6xl px-6 py-20 md:py-24"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-label text-xs uppercase tracking-wider text-[var(--accent)]">
          Producción
        </p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Del prototipo a producción
        </h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Un agente que funciona en una demo no es lo mismo que uno del que una
          empresa pueda depender. Así lo encaro.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {practices.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-6"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <p.icon size={18} />
            </div>
            <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
              {p.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
