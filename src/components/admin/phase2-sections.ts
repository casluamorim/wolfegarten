import type { ContentSection } from "@/components/admin/ContentEditor";

/** Configuração de seções editáveis para cada página da Fase 2.
 *  Reusa o mesmo schema do ContentEditor (campos com kind/media). */
export const PHASE2_SECTIONS: Record<string, ContentSection[]> = {
  home: [
    {
      id: "seo",
      title: "SEO da Home",
      fields: [
        { key: "phase2.home.seo.title", label: "Título da página" },
        { key: "phase2.home.seo.description", label: "Meta descrição", kind: "textarea" },
      ],
    },
    {
      id: "hero",
      title: "Hero (capa) — apenas imagem",
      description: "Hero limpo e elegante. O vídeo institucional fica na seção logo abaixo.",
      fields: [
        { key: "phase2.home.hero.eyebrow", label: "Etiqueta superior" },
        { key: "phase2.home.hero.title_line1", label: "Título — linha 1" },
        { key: "phase2.home.hero.title_line2", label: "Título — linha 2 (dourado)" },
        { key: "phase2.home.hero.subtitle", label: "Subtítulo", kind: "textarea" },
        { key: "phase2.home.hero.cta", label: "Texto do botão" },
        { key: "phase2.home.hero.image_url", label: "Imagem do hero", kind: "media", mediaKinds: ["image"] },
      ],
    },
    {
      id: "video",
      title: "Vídeo institucional",
      fields: [
        { key: "phase2.home.video.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.video.title", label: "Título" },
        { key: "phase2.home.video.video_url", label: "Vídeo", kind: "media", mediaKinds: ["video"] },
        { key: "phase2.home.video.video_poster", label: "Poster do vídeo", kind: "media", mediaKinds: ["image"] },
      ],
    },
    {
      id: "conceito",
      title: "Conceito",
      description: "Mídia flexível — escolha imagem OU vídeo.",
      fields: [
        { key: "phase2.home.conceito.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.conceito.title", label: "Título" },
        { key: "phase2.home.conceito.text", label: "Texto", kind: "textarea" },
        { key: "phase2.home.conceito.media_type", label: "Tipo de mídia (image | video)" },
        { key: "phase2.home.conceito.image_url", label: "Imagem", kind: "media", mediaKinds: ["image"] },
        { key: "phase2.home.conceito.video_url", label: "Vídeo", kind: "media", mediaKinds: ["video"] },
      ],
    },
    {
      id: "diferenciais",
      title: "Diferenciais",
      fields: [
        { key: "phase2.home.diferenciais.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.diferenciais.title", label: "Título" },
        { key: "phase2.home.diferenciais.item1_title", label: "Item 1 — título" },
        { key: "phase2.home.diferenciais.item1_text", label: "Item 1 — texto", kind: "textarea" },
        { key: "phase2.home.diferenciais.item2_title", label: "Item 2 — título" },
        { key: "phase2.home.diferenciais.item2_text", label: "Item 2 — texto", kind: "textarea" },
        { key: "phase2.home.diferenciais.item3_title", label: "Item 3 — título" },
        { key: "phase2.home.diferenciais.item3_text", label: "Item 3 — texto", kind: "textarea" },
        { key: "phase2.home.diferenciais.item4_title", label: "Item 4 — título" },
        { key: "phase2.home.diferenciais.item4_text", label: "Item 4 — texto", kind: "textarea" },
      ],
    },
    {
      id: "renders",
      title: "Renders 3D",
      description: "Galeria com tag 'renders' da Biblioteca de Mídia.",
      fields: [
        { key: "phase2.home.renders.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.renders.title", label: "Título" },
      ],
    },
    {
      id: "infra",
      title: "Infraestrutura",
      fields: [
        { key: "phase2.home.infra.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.infra.title", label: "Título" },
        { key: "phase2.home.infra.text", label: "Texto", kind: "textarea" },
        { key: "phase2.home.infra.media_type", label: "Tipo de mídia (image | video)" },
        { key: "phase2.home.infra.image_url", label: "Imagem", kind: "media", mediaKinds: ["image"] },
        { key: "phase2.home.infra.video_url", label: "Vídeo", kind: "media", mediaKinds: ["video"] },
      ],
    },
    {
      id: "lazer",
      title: "Áreas de Lazer",
      fields: [
        { key: "phase2.home.lazer.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.lazer.title", label: "Título" },
        { key: "phase2.home.lazer.text", label: "Texto", kind: "textarea" },
        { key: "phase2.home.lazer.media_type", label: "Tipo de mídia (image | video)" },
        { key: "phase2.home.lazer.image_url", label: "Imagem", kind: "media", mediaKinds: ["image"] },
        { key: "phase2.home.lazer.video_url", label: "Vídeo", kind: "media", mediaKinds: ["video"] },
      ],
    },
    {
      id: "masterplan",
      title: "Masterplan",
      fields: [
        { key: "phase2.home.masterplan.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.masterplan.title", label: "Título" },
        { key: "phase2.home.masterplan.text", label: "Texto", kind: "textarea" },
        { key: "phase2.home.masterplan.image_url", label: "Imagem do masterplan", kind: "media", mediaKinds: ["image"] },
      ],
    },
    {
      id: "localizacao",
      title: "Localização",
      fields: [
        { key: "phase2.home.localizacao.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.localizacao.title", label: "Título" },
        { key: "phase2.home.localizacao.text", label: "Texto", kind: "textarea" },
        { key: "phase2.home.localizacao.address", label: "Endereço (curto)" },
      ],
    },
    {
      id: "cta",
      title: "CTA de visita",
      fields: [
        { key: "phase2.home.cta.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.cta.title", label: "Título" },
        { key: "phase2.home.cta.text", label: "Texto", kind: "textarea" },
        { key: "phase2.home.cta.button", label: "Texto do botão" },
        { key: "phase2.home.cta.media_type", label: "Tipo de mídia (image | video)" },
        { key: "phase2.home.cta.image_url", label: "Imagem", kind: "media", mediaKinds: ["image"] },
        { key: "phase2.home.cta.video_url", label: "Vídeo", kind: "media", mediaKinds: ["video"] },
      ],
    },
    {
      id: "contato",
      title: "Bloco de contato",
      fields: [
        { key: "phase2.home.contato.eyebrow", label: "Etiqueta" },
        { key: "phase2.home.contato.title", label: "Título" },
        { key: "phase2.home.contato.subtitle", label: "Subtítulo", kind: "textarea" },
        { key: "phase2.home.contato.button", label: "Texto do botão" },
      ],
    },
    {
      id: "menu",
      title: "Menu (JSON)",
      description: "Itens do menu primário (visíveis no topo) e secundário (overlay). Edite como JSON.",
      fields: [
        { key: "phase2.menu.primary", label: "Menu primário", kind: "textarea", hint: '[{"label":"Home","to":"/"}]' },
        { key: "phase2.menu.secondary", label: "Menu secundário", kind: "textarea", hint: '[{"label":"Galeria","to":"/galeria"}]' },
      ],
    },
  ],
  empreendimento: simplePage("empreendimento"),
  infraestrutura: simplePage("infraestrutura"),
  lazer: simplePage("lazer"),
  masterplan: simplePage("masterplan"),
  galeria: simplePage("galeria"),
  videos: simplePage("videos"),
  localizacao: simplePage("localizacao"),
  contato: simplePage("contato"),
};

function simplePage(slug: string): ContentSection[] {
  return [
    {
      id: "seo",
      title: "SEO",
      fields: [
        { key: `phase2.${slug}.seo.title`, label: "Título da página" },
        { key: `phase2.${slug}.seo.description`, label: "Meta descrição", kind: "textarea" },
      ],
    },
    {
      id: "content",
      title: "Conteúdo",
      fields: [
        { key: `phase2.${slug}.title`, label: "Título" },
        { key: `phase2.${slug}.text`, label: "Texto", kind: "textarea" },
        { key: `phase2.${slug}.media_type`, label: "Tipo de mídia (image | video)" },
        { key: `phase2.${slug}.image_url`, label: "Imagem", kind: "media", mediaKinds: ["image"] },
        { key: `phase2.${slug}.video_url`, label: "Vídeo", kind: "media", mediaKinds: ["video"] },
      ],
    },
  ];
}
