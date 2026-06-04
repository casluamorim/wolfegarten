import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/infraestrutura")({
  head: phase2Head("infraestrutura", {
    title: "Infraestrutura",
    description: "Tecnologia, segurança e conforto em cada detalhe do Wölfegarten.",
  }),
  component: () => (
    <InternalPage
      slug="infraestrutura"
      defaultTitle="Infraestrutura"
      defaultEyebrow="INFRAESTRUTURA"
      defaultSubtitle="Cabeamento subterrâneo, portaria 24h, segurança avançada e ruas projetadas para a convivência."
    />
  ),
});
