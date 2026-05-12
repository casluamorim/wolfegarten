import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/contato")({
  head: phase2Head("contato", {
    title: "Contato",
    description: "Agende sua visita ao Wölfegarten — fale com nosso time.",
  }),
  component: () => <Phase2Page pageKey="contato" variant="contato" />,
});
