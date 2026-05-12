import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/empreendimento")({
  head: phase2Head("empreendimento", {
    title: "O Empreendimento",
    description: "Conceito arquitetônico exclusivo, integrado à natureza de Indaial.",
  }),
  component: () => <Phase2Page pageKey="empreendimento" variant="simple" />,
});
