import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

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

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const phase = await getPhase();
        const origin = new URL(request.url).origin;
        const body =
          phase === "live"
            ? `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
            : `User-agent: *\nDisallow: /\n`;
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
