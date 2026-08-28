"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#projects", label: "Proyectos" },
  { href: "#assistant", label: "Asistente" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experiencia" },
  { href: "#certifications", label: "Certificaciones" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 z-50 w-full border-b border-[var(--border)]/60 bg-[var(--background)]/70 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="font-mono-code text-sm text-[var(--foreground)]">
          <span className="text-[var(--accent)]">&gt;</span> bautista.carrera
          <span className="cursor-blink text-[var(--accent)]">_</span>
        </a>

        <ul className="hidden gap-8 text-sm text-[var(--muted)] md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="transition-colors hover:text-[var(--accent)]"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="#contact"
            className="rounded-full border border-[var(--accent)]/40 px-4 py-1.5 text-xs font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
          >
            Contactar
          </a>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)] md:hidden"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[var(--border)]/60 bg-[var(--background)]/95 backdrop-blur-md md:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4 text-sm text-[var(--muted)]">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-2 transition-colors hover:text-[var(--accent)]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
              <li className="mt-2">
                <a
                  href="#contact"
                  onClick={() => setOpen(false)}
                  className="block rounded-full border border-[var(--accent)]/40 px-4 py-2 text-center text-xs font-medium text-[var(--accent)]"
                >
                  Contactar
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
