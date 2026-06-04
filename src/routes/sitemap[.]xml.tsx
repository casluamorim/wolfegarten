import { createFileRoute } from "@tanstack/react-router";

const PAGES = [
  "",
  "empreendimento",
  "infraestrutura",
  "academias",
  "piscina",
  "lazer",
  "masterplan",
  "galeria",
  "videos",
  "localizacao",
  "contato",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const today = new Date().toISOString().slice(0, 10);

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          PAGES.map(
            (p) =>
              `  <url><loc>${origin}/${p}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`,
          ).join("\n") +
          `\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
