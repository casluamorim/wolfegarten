import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/piscina")({
  head: phase2Head("piscina", {
    title: "Piscina",
    description: "Piscinas e áreas aquáticas premium no Wölfegarten Indaial.",
  }),
  component: () => (
    <InternalPage
      slug="piscina"
      defaultTitle="Piscina"
      defaultEyebrow="ÁGUA E LAZER"
      defaultSubtitle="Piscinas, deck molhado e ambientes para relaxar com a família."
    />
  ),
});
