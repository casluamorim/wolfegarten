import { createFileRoute } from "@tanstack/react-router";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Countdown } from "@/components/Countdown";
import { Marco } from "@/components/Marco";
import { Experience } from "@/components/Experience";
import { Info } from "@/components/Info";
import { Vagas } from "@/components/Vagas";
import { Confirm } from "@/components/Confirm";
import { Institucional } from "@/components/Institucional";
import { Footer } from "@/components/Footer";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLaunchPhase, useSectionVisible } from "@/hooks/use-launch";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wölfegarten — Convite Exclusivo | Alto padrão em Indaial" },
      { name: "description", content: "Experiência Wölfegarten: convite exclusivo para o lançamento do mais novo loteamento de altíssimo padrão em Indaial, SC." },
      { property: "og:title", content: "Experiência Wölfegarten — Convite Exclusivo" },
      { property: "og:description", content: "Um encontro para quem está pronto para viver e investir em um novo padrão." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useSiteContent();
  const phase = useLaunchPhase();

  const showCountdown = useSectionVisible("countdown") && phase === "pre";
  const showMarco = useSectionVisible("marco");
  const showExperience = useSectionVisible("experience");
  const showInfo = useSectionVisible("info") && phase === "pre";
  const showVagas = useSectionVisible("vagas") && phase === "pre";
  const showConfirm = useSectionVisible("confirm");
  const showInstitucional = useSectionVisible("institucional") && phase === "post";

  useEffect(() => {
    if (!data) return;
    if (typeof data["seo.title"] === "string") document.title = data["seo.title"] as string;
    const setMeta = (sel: string, value: string) => {
      const el = document.querySelector<HTMLMetaElement>(sel);
      if (el) el.setAttribute("content", value);
    };
    if (typeof data["seo.description"] === "string")
      setMeta('meta[name="description"]', data["seo.description"] as string);
    if (typeof data["seo.og_title"] === "string")
      setMeta('meta[property="og:title"]', data["seo.og_title"] as string);
    if (typeof data["seo.og_description"] === "string")
      setMeta('meta[property="og:description"]', data["seo.og_description"] as string);
  }, [data]);

  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main>
        <Hero />
        {showCountdown && <Countdown />}
        {showInstitucional && <Institucional />}
        {showMarco && <Marco />}
        {showExperience && <Experience />}
        {showInfo && <Info />}
        {showVagas && <Vagas />}
        {showConfirm && <Confirm />}
      </main>
      <Footer />
    </>
  );
}
