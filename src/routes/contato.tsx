import { createFileRoute } from "@tanstack/react-router";
import { InternalPage } from "@/components/phase2/InternalPage";
import { phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/contato")({
  head: phase2Head("contato", {
    title: "Contato",
    description: "Agende sua visita ao Wölfegarten — fale com nosso time.",
  }),
  component: () => (
    <InternalPage
      slug="contato"
      defaultTitle="Contato"
      defaultEyebrow="FALE CONOSCO"
      defaultSubtitle="Agende sua visita à Central de Vendas ou converse com nosso time pelo WhatsApp."
      showGallery={false}
      showVideos={false}
    />
  ),
});
