import { createFileRoute } from "@tanstack/react-router";
import { Phase2Page, phase2Head } from "@/components/phase2/Phase2Page";

export const Route = createFileRoute("/localizacao")({
  head: phase2Head("localizacao", {
    title: "Localização",
    description: "No coração de Indaial, com fácil acesso a tudo. Conheça a localização do Wölfegarten.",
  }),
  component: () => <Phase2Page pageKey="localizacao" variant="simple" />,
});
