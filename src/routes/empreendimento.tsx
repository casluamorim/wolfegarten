import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/empreendimento")({
  head: phase2Head("empreendimento", {
    title: "O Empreendimento",
    description: "Conceito arquitetônico exclusivo, integrado à natureza de Indaial.",
  }),
  component: () => (
    <InternalPage
      slug="empreendimento"
      defaultTitle="O Empreendimento"
      defaultEyebrow="O EMPREENDIMENTO"
      defaultSubtitle="Um novo padrão de viver em Indaial — concebido para quem busca exclusividade, natureza e sofisticação."
    />
  ),
});
