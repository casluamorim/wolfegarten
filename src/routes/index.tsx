import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/LoadingScreen";
import { HomePhase2 } from "@/components/phase2/HomePhase2";
import { useSiteContent } from "@/hooks/use-site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wölfegarten — Loteamento de altíssimo padrão em Indaial/SC" },
      {
        name: "description",
        content:
          "Wölfegarten é um loteamento fechado de altíssimo padrão em Indaial/SC. Exclusividade, natureza e um novo conceito de viver.",
      },
      { property: "og:title", content: "Wölfegarten — Alto padrão em Indaial/SC" },
      {
        property: "og:description",
        content:
          "Loteamento fechado de altíssimo padrão. Exclusividade, sofisticação e natureza em Indaial/SC.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://wolfegarten.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://wolfegarten.lovable.app/" }],
  }),
  component: Index,
});

function Index() {
  const { data } = useSiteContent();

  // CMS-driven overrides para SEO
  useEffect(() => {
    if (!data) return;
    const t = data["seo.title"] ?? data["phase2.home.seo.title"];
    if (typeof t === "string" && t) document.title = t;
    const setMeta = (sel: string, value: string) => {
      const el = document.querySelector<HTMLMetaElement>(sel);
      if (el) el.setAttribute("content", value);
    };
    const desc = data["seo.description"] ?? data["phase2.home.seo.description"];
    if (typeof desc === "string" && desc) {
      setMeta('meta[name="description"]', desc);
      setMeta('meta[property="og:description"]', desc);
    }
  }, [data]);

  return (
    <>
      <LoadingScreen />
      <HomePhase2 />
    </>
  );
}
