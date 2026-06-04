import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/videos")({
  head: phase2Head("videos", {
    title: "Vídeos",
    description: "Vídeos institucionais e tour pelo Wölfegarten.",
  }),
  component: () => (
    <InternalPage
      slug="videos"
      defaultTitle="Vídeos"
      defaultEyebrow="VÍDEOS"
      defaultSubtitle="Filmes institucionais, tour aéreo e prévias do empreendimento."
      fullVideos
      showGallery={false}
    />
  ),
});
