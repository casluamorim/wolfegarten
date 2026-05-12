import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/masterplan")({
  head: phase2Head("masterplan", {
    title: "Masterplan",
    description: "Conheça o masterplan do Wölfegarten — distribuição de lotes, áreas e infraestrutura.",
  }),
  component: () => <Phase2Page pageKey="masterplan" variant="simple" />,
});
