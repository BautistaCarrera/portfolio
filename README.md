# Bautista Carrera — Portfolio

Portfolio personal de **Bautista Carrera**, AI Developer especializado en sistemas de agentes autónomos, orquestación de LLMs y automatización aplicada a procesos de negocio.

🔗 **Live:** [bautistacarrera.vercel.app](https://bautistacarrera.vercel.app)

## Sobre el proyecto

Portfolio construido con Next.js 16 (App Router), Tailwind CSS y Framer Motion, con foco en mostrar sistemas de IA reales en producción, no proyectos genéricos de tutorial.

### Highlights

- **Asistente de IA en vivo**: un orquestador que deriva cada consulta a 5 agentes especializados (Ventas, Cobranzas, Soporte, Administración, Contabilidad), corriendo sobre Gemini con fallback automático a OpenRouter.
- **Case studies reales**: 3 proyectos de agentes autónomos en producción (procesamiento de facturas con visión + Odoo, equipo de soporte técnico vía WhatsApp/SSH, automatización de bandeja de entrada), documentados con arquitectura y decisiones técnicas.
- **CV descargable e integrado** con links reales a portfolio, LinkedIn y contacto.

## Stack

- **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Framer Motion
- **IA:** Google Gemini (`gemini-3.6-flash`) + cascada de fallback en OpenRouter
- **Analytics:** Vercel Analytics
- **Deploy:** Vercel

## Desarrollo local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000). Necesitás un `.env.local` con `GEMINI_API_KEY` y `OPENROUTER_API_KEY` para que el asistente de IA funcione en desarrollo.
