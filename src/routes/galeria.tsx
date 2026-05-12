import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/galeria")({
  head: phase2Head("galeria", {
    title: "Galeria",
    description: "Imagens e renders do empreendimento Wölfegarten em Indaial.",
  }),
  component: () => <Phase2Page pageKey="galeria" variant="galeria" />,
});
