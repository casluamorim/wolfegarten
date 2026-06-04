import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/lazer")({
  head: phase2Head("lazer", {
    title: "Áreas de Lazer",
    description: "Espaços pensados para todas as gerações no Wölfegarten Indaial.",
  }),
  component: () => (
    <InternalPage
      slug="lazer"
      defaultTitle="Áreas de Lazer"
      defaultEyebrow="LAZER"
      defaultSubtitle="Praças, playground, espaço gourmet e ambientes integrados à natureza."
    />
  ),
});
