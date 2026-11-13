import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import MotionProvider from "@/components/MotionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = "https://bautistacarrera.vercel.app";
const TITLE = "Bautista Carrera — AI Developer";
const DESCRIPTION =
  "Desarrollador de IA: agentes autónomos que funcionan en producción, integrados a tus sistemas (ERP, CRM, mensajería), con control humano y trazabilidad.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  keywords: [
    "AI Developer",
    "Agent Engineer",
    "sistemas multi-agente",
    "orquestación de LLMs",
    "automatización con IA",
    "Bautista Carrera",
  ],
  authors: [{ name: "Bautista Carrera", url: SITE_URL }],
  openGraph: {
    title: TITLE,
    description:
      "Agentes autónomos en producción: integración con ERP, CRM y mensajería, con control humano y trazabilidad.",
    type: "website",
    url: SITE_URL,
    siteName: "Bautista Carrera — Portfolio",
    locale: "es_AR",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bautista Carrera — AI Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Bautista Carrera",
              jobTitle: "AI Developer",
              url: SITE_URL,
              email: "mailto:carrerabauti@gmail.com",
              knowsLanguage: ["es", "en"],
              sameAs: [
                "https://www.linkedin.com/in/bautista-carrera-/",
              ],
              knowsAbout: [
                "Multi-agent systems",
                "LLM orchestration",
                "AI automation",
                "MCP",
                "Odoo integration",
              ],
            }),
          }}
        />
      </head>
      <body className={`${geistSans.variable} antialiased`}>
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
