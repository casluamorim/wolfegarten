import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/masterplan")({
  head: phase2Head("masterplan", {
    title: "Masterplan",
    description: "Conheça o masterplan do Wölfegarten — distribuição de lotes, áreas e infraestrutura.",
  }),
  component: () => (
    <InternalPage
      slug="masterplan"
      defaultTitle="Masterplan"
      defaultEyebrow="MASTERPLAN"
      defaultSubtitle="O desenho urbanístico completo: lotes, vias, áreas verdes e equipamentos coletivos."
    />
  ),
});
