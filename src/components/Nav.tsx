"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#approach", label: "Enfoque" },
  { href: "#projects", label: "Proyectos" },
  { href: "#assistant", label: "Asistente" },
  { href: "#skills", label: "Skills" },
  { href: "#experience", label: "Experiencia" },
  { href: "#certifications", label: "Certificaciones" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  // Resalta el link de la sección que está en pantalla.
  useEffect(() => {
    const ids = ["top", ...links.map((l) => l.href.slice(1)), "contact"];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id === "top" ? "" : e.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Esc cierra el menú móvil.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 z-50 w-full border-b border-[var(--border)]/60 bg-[var(--background)]/70 backdrop-blur-md"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="inline-flex min-h-11 items-center text-base font-semibold tracking-tight text-[var(--foreground)]">
          <span>Bautista</span><span className="ml-1.5 text-[var(--accent)]">Carrera</span>
        </a>

        <ul className="hidden gap-5 text-sm lg:gap-8 text-[var(--muted)] lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                aria-current={active === l.href.slice(1) ? "true" : undefined}
                className={`transition-colors hover:text-[var(--accent)] ${
                  active === l.href.slice(1) ? "text-[var(--accent)]" : ""
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="#contact"
            className="rounded-full border border-[var(--accent)]/40 inline-flex min-h-9 items-center px-4 text-xs font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/10"
          >
            Contactar
          </a>
        </div>

        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)] lg:hidden"
        >
          {open ? <X size={16} /> : <Menu size={16} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[var(--border)]/60 bg-[var(--background)]/95 backdrop-blur-md lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-6 py-4 text-sm text-[var(--muted)]">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 transition-colors hover:text-[var(--accent)]"
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
