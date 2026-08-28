"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export default function AgentNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setSize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setSize();

    const NODE_COUNT = 34;
    const nodes: Node[] = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.6 + 1,
    }));

    const LINK_DIST = 130;
    let raf = 0;
    let pulseT = 0;

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      pulseT += 0.01;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.35;
            ctx.strokeStyle = `rgba(94, 234, 212, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n, i) => {
        const glow = 0.5 + 0.5 * Math.sin(pulseT * 2 + i);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = i % 5 === 0
          ? `rgba(129, 140, 248, ${0.5 + glow * 0.5})`
          : `rgba(94, 234, 212, ${0.4 + glow * 0.4})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => setSize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
}
