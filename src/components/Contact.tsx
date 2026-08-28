"use client";

import { motion } from "framer-motion";
import { Link2, Mail, MessageCircle } from "lucide-react";

const links = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    href: "https://wa.me/5492477504122",
    highlight: true,
  },
  {
    icon: Mail,
    label: "carrerabauti@gmail.com",
    href: "mailto:carrerabauti@gmail.com",
  },
  {
    icon: Link2,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/bautista-carrera-/",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 px-8 py-16 text-center"
      >
        <p className="font-mono-code text-xs uppercase tracking-widest text-[var(--accent)]">
          /contact
        </p>
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Disponible para nuevos proyectos
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
          Abierto a oportunidades como AI Developer / Agent Engineer.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className={
                l.highlight
                  ? "flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[#05070d] transition-transform hover:scale-105"
                  : "flex items-center gap-2 rounded-full border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
              }
            >
              <l.icon size={16} />
              {l.label}
            </a>
          ))}
        </div>
      </motion.div>

      <p className="mt-10 text-center font-mono-code text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} Bautista Carrera
      </p>
    </section>
  );
}
