import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/infraestrutura")({
  head: phase2Head("infraestrutura", {
    title: "Infraestrutura",
    description: "Tecnologia, segurança e conforto em cada detalhe do Wölfegarten.",
  }),
  component: () => <Phase2Page pageKey="infraestrutura" variant="simple" />,
});
