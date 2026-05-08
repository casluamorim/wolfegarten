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
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wölfegarten — Convite Exclusivo | Alto padrão em Indaial" },
      {
        name: "description",
        content:
          "Experiência Wölfegarten: convite exclusivo para o lançamento do mais novo loteamento de altíssimo padrão em Indaial, SC. 16 de maio.",
      },
      { property: "og:title", content: "Experiência Wölfegarten — Convite Exclusivo" },
      {
        property: "og:description",
        content:
          "Um encontro para quem está pronto para viver e investir em um novo padrão.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <LoadingScreen />
      <Navbar />
      <main>
        <Hero />
        <Countdown />
        <Marco />
        <Experience />
        <Info />
        <Vagas />
        <Confirm />
      </main>
      <Footer />
    </>
  );
}
