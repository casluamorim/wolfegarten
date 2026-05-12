import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/lazer")({
  head: phase2Head("lazer", {
    title: "Áreas de Lazer",
    description: "Espaços pensados para todas as gerações no Wölfegarten Indaial.",
  }),
  component: () => <Phase2Page pageKey="lazer" variant="simple" />,
});
