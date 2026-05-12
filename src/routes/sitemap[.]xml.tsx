import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const PHASE2_PAGES = [
  "empreendimento",
  "infraestrutura",
  "lazer",
  "masterplan",
  "galeria",
  "videos",
  "localizacao",
  "contato",
];

async function getPhase(): Promise<"live" | "pre-launch"> {
  try {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) return "pre-launch";
    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data } = await sb
      .from("site_content")
      .select("key,value")
      .in("key", ["launch.phase", "launch.auto_switch", "launch.date"]);
    const map: Record<string, string> = {};
    for (const r of data ?? []) map[r.key] = typeof r.value === "string" ? r.value : JSON.stringify(r.value);
    const phase = (map["launch.phase"] || "").replace(/"/g, "");
    const auto = (map["launch.auto_switch"] || "").replace(/"/g, "") === "true";
    const target = (map["launch.date"] || "").replace(/"/g, "");
    const ts = target ? Date.parse(target) : Number.NaN;
    if (auto && Number.isFinite(ts) && Date.now() >= ts) return "live";
    return phase === "live" ? "live" : "pre-launch";
  } catch {
    return "pre-launch";
  }
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const phase = await getPhase();
        const today = new Date().toISOString().slice(0, 10);

        const urls = [`${origin}/`];
        if (phase === "live") {
          for (const p of PHASE2_PAGES) urls.push(`${origin}/${p}`);
        }

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          urls
            .map(
              (u) =>
                `  <url><loc>${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq></url>`,
            )
            .join("\n") +
          `\n</urlset>\n`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
