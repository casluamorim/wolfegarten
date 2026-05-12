import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/videos")({
  head: phase2Head("videos", {
    title: "Vídeos",
    description: "Vídeos institucionais e tour pelo Wölfegarten.",
  }),
  component: () => <Phase2Page pageKey="videos" variant="videos" />,
});
