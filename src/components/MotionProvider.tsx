"use client";

import { MotionConfig } from "framer-motion";

// Respeta "reducir movimiento" del sistema en todas las animaciones de framer-motion.
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
