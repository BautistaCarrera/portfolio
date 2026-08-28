"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Check, X } from "lucide-react";
import Image from "next/image";

interface Certificate {
  title: string;
  image: string;
}

const CERTIFICATES: Certificate[] = [
  { title: "Introducción a Java", image: "/certificados/java.png" },
  { title: "Desarrollo Web con HTML", image: "/certificados/html.png" },
  { title: "JavaScript desde cero", image: "/certificados/javascript.png" },
  { title: "C# .NET para no programadores", image: "/certificados/csharp.png" },
  { title: "Introducción a Bases de Datos y SQL", image: "/certificados/sql.png" },
  { title: "Programación orientada a objetos con IA", image: "/certificados/poo-ia.png" },
];

export default function Certifications() {
  const [selected, setSelected] = useState<Certificate | null>(null);

  return (
    <section id="certifications" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
          /certifications
        </p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Certificaciones
        </h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
          Cursos completados en EducaciónIT.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CERTIFICATES.map((cert, i) => (
          <motion.button
            key={cert.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            onClick={() => setSelected(cert)}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 text-left transition-colors hover:border-[var(--accent)]/40"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-[var(--border)] bg-[var(--background-alt)]">
              <Image
                src={cert.image}
                alt={`Certificado — ${cert.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                style={{ aspectRatio: "4 / 3" }}
                className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-start gap-2">
                <Award size={14} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                <span className="text-sm font-medium">{cert.title}</span>
              </div>
              <span className="flex w-fit items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 font-mono-code text-[10px] text-[var(--accent)]">
                <Check size={10} />
                Completado
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative h-[75vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]"
            >
              <button
                onClick={() => setSelected(null)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--background)]/80 text-[var(--foreground)] hover:text-[var(--accent)]"
              >
                <X size={16} />
              </button>
              <div className="relative h-full w-full">
                <Image
                  src={selected.image}
                  alt={`Certificado — ${selected.title}`}
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
