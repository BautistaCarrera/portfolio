import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://bautistacarrera.vercel.app", lastModified: new Date("2026-11-12"), changeFrequency: "monthly", priority: 1 }];
}
