"use client";

import { motion } from "framer-motion";
import {
  Eye,
  FileCheck2,
  Hammer,
  Inbox,
  Mail,
  MessageCircle,
  PenLine,
  Search,
  ShieldCheck,
  StickyNote,
  Workflow,
  type LucideIcon,
} from "lucide-react";

interface FlowStep {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface CaseStudy {
  title: string;
  summary: string;
  tags: string[];
  flow: FlowStep[];
  why: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    title: "Agente de Carga Contable",
    summary:
      "Un agente conversacional (vía Telegram) que recibe comprobantes de proveedores, los lee con visión, valida los datos con el usuario y los carga directo en Odoo — el ERP contable real de la empresa — listos para IVA y contabilidad.",
    tags: ["Visión (LLM multimodal)", "Odoo ERP", "Telegram", "Human-in-the-loop"],
    flow: [
      {
        icon: Eye,
        title: "Captura y lectura",
        desc: "Recibe fotos o PDFs de facturas, notas de crédito y comprobantes. Extrae con visión: tipo, fecha, proveedor, CUIT, punto de venta, neto gravado, IVA, impuestos y CAE.",
      },
      {
        icon: ShieldCheck,
        title: "Validación humana",
        desc: "Muestra lo que leyó antes de actuar. El usuario confirma o corrige, y clasifica el gasto (personal/empresa, recurrente o no) antes de cualquier carga.",
      },
      {
        icon: Workflow,
        title: "Vinculación contable",
        desc: "Si es recurrente, propone las órdenes de compra proyectadas para vincular. Sugiere la cuenta contable de imputación y espera confirmación.",
      },
      {
        icon: FileCheck2,
        title: "Carga en el ERP",
        desc: "Registra la factura en Odoo con su adjunto, como borrador hasta revisión humana. Todo queda en el sistema contable real — no en un archivo local.",
      },
    ],
    why: "no solo lee un documento — decide qué hacer con el dato dentro de un sistema de negocio real, con control humano en cada paso crítico (excessive agency bajo control) y sin tocar nada hasta recibir confirmación.",
  },
  {
    title: "Equipo de Agentes de Soporte",
    summary:
      "Un equipo de agentes que automatiza la atención de soporte técnico: recibe al cliente por WhatsApp, abre el ticket y hace el diagnóstico técnico avanzado sobre el sistema real antes de que intervenga una persona.",
    tags: ["Sistemas agénticos", "WhatsApp", "Odoo", "SSH / VPS"],
    flow: [
      {
        icon: MessageCircle,
        title: "Primer contacto",
        desc: "Un agente recibe al cliente por WhatsApp, lo identifica y abre el ticket correspondiente en el sistema.",
      },
      {
        icon: Search,
        title: "Diagnóstico técnico",
        desc: "Otro agente investiga el caso sobre el sistema real — accediendo por SSH al servidor cuando hace falta — para entender qué está pasando de verdad, no solo repetir lo que dice el cliente.",
      },
      {
        icon: StickyNote,
        title: "Notas internas",
        desc: "Deja documentado en el ticket lo que encontró: causa probable, qué revisó, qué descartó — contexto listo para quien continúe el caso.",
      },
      {
        icon: FileCheck2,
        title: "Resolución o escalamiento",
        desc: "Si es un caso conocido, lo resuelve directo. Si no, lo escala al equipo humano con el diagnóstico ya hecho, no solo el mensaje del cliente.",
      },
    ],
    why: "descarga al equipo humano de lo repetitivo y acelera la resolución real — el diagnóstico técnico ya está hecho cuando una persona lo mira, en vez de arrancar de cero.",
  },
  {
    title: "Agente de Email Automatizado",
    summary:
      "Automatiza la bandeja de entrada de un directivo: clasifica el correo, lo resume y deja borradores de respuesta listos para revisar — nunca envía un mail solo. Es parte de un equipo más amplio que además carga información y genera reportes.",
    tags: ["Sistemas agénticos", "Gmail", "Telegram", "Python"],
    flow: [
      {
        icon: Inbox,
        title: "Sincronización",
        desc: "Se conecta a la bandeja de entrada real y la mantiene sincronizada, sin depender de que alguien revise el mail manualmente para que el sistema tenga el estado al día.",
      },
      {
        icon: Mail,
        title: "Clasificación y prioridad",
        desc: "Ordena cada mail por urgencia y tema (comercial, interno, requiere acción, descartable) para que lo importante no se pierda entre el volumen diario.",
      },
      {
        icon: PenLine,
        title: "Resumen y borrador",
        desc: "Resume los correos largos y redacta un borrador de respuesta con el contexto real del negocio, con el tono adecuado a cada interlocutor.",
      },
      {
        icon: ShieldCheck,
        title: "Aprobación humana",
        desc: "Entrega el borrador listo por Telegram para que el directivo lo revise, edite si hace falta, y recién ahí lo envíe. El agente nunca manda un mail por su cuenta.",
      },
    ],
    why: "libera horas de gestión de bandeja de entrada sin sacarle el control a la persona — el agente prepara todo, pero la decisión final de qué se envía siempre es humana.",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
          /projects
        </p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Proyectos de agentes
        </h2>
      </motion.div>

      <div className="mt-12 space-y-6">
        {CASE_STUDIES.map((cs, csIndex) => (
          <motion.div
            key={cs.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 + csIndex * 0.05 }}
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/60"
          >
            <div className="border-b border-[var(--border)] bg-[var(--background-alt)] px-6 py-5 sm:px-8">
              <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
                case study — en producción
              </p>
              <h3 className="mt-1 text-xl font-semibold sm:text-2xl">
                {cs.title}
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                {cs.summary}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {cs.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] px-3 py-1 font-mono-code text-[11px] text-[var(--muted)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-px bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
              {cs.flow.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="bg-[var(--card)] p-6"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]/10 text-[var(--accent)]">
                      <step.icon size={15} />
                    </div>
                    <span className="font-mono-code text-xs text-[var(--muted)]">
                      0{i + 1}
                    </span>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold">{step.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-[var(--border)] px-6 py-4 sm:px-8">
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                <span className="text-[var(--accent)]">Por qué importa:</span>{" "}
                {cs.why}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder próximos proyectos */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/30 px-6 py-14 text-center"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
          <Hammer size={18} />
        </div>
        <h3 className="text-base font-medium">Más case studies en camino</h3>
        <p className="max-w-md text-sm text-[var(--muted)]">
          Sumando nuevos proyectos de sistemas de agentes autónomos, cada uno
          con arquitectura, decisiones técnicas y resultados medibles.
        </p>
      </motion.div>
    </section>
  );
}
