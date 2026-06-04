import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/localizacao")({
  head: phase2Head("localizacao", {
    title: "Localização",
    description: "No coração de Indaial, com fácil acesso a tudo. Conheça a localização do Wölfegarten.",
  }),
  component: () => (
    <InternalPage
      slug="localizacao"
      defaultTitle="Localização"
      defaultEyebrow="LOCALIZAÇÃO"
      defaultSubtitle="Indaial — Santa Catarina. A poucos minutos do centro, das principais vias e da natureza."
    />
  ),
});
