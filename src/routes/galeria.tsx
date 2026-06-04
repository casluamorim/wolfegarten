import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/galeria")({
  head: phase2Head("galeria", {
    title: "Galeria",
    description: "Imagens e renders do empreendimento Wölfegarten em Indaial.",
  }),
  component: () => (
    <InternalPage
      slug="galeria"
      defaultTitle="Galeria"
      defaultEyebrow="GALERIA"
      defaultSubtitle="Renders, paisagismo e atmosfera do empreendimento."
      fullGallery
      showVideos={false}
    />
  ),
});
