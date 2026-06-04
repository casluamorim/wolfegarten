import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/academias")({
  head: phase2Head("academias", {
    title: "Academias",
    description: "Academias completas e estúdios fitness exclusivos para moradores do Wölfegarten.",
  }),
  component: () => (
    <InternalPage
      slug="academias"
      defaultTitle="Academias"
      defaultEyebrow="WELLNESS"
      defaultSubtitle="Academias completas, estúdios funcionais e espaços para treinos personalizados."
    />
  ),
});
