import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { LivePreview } from "@/components/admin/LivePreview";
import type { MediaKind } from "@/hooks/use-media-library";


type FieldKind = "text" | "textarea" | "url" | "datetime" | "tel" | "media";

export interface ContentField {
  key: string;
  label: string;
  kind?: FieldKind;
  hint?: string;
  mediaKinds?: MediaKind[];
}

export interface ContentSection {
  id: string;
  title: string;
  description?: string;
  group: "Home" | "Páginas" | "Geral";
  previewPath: string;
  fields: ContentField[];
}

const INTERNAL_PAGES: { slug: string; label: string }[] = [
  { slug: "empreendimento", label: "O Empreendimento" },
  { slug: "infraestrutura", label: "Infraestrutura" },
  { slug: "academias", label: "Academias" },
  { slug: "piscina", label: "Piscina" },
  { slug: "lazer", label: "Áreas de Lazer" },
  { slug: "masterplan", label: "Masterplan" },
  { slug: "galeria", label: "Galeria" },
  { slug: "videos", label: "Vídeos" },
  { slug: "localizacao", label: "Localização" },
  { slug: "contato", label: "Contato" },
];

function buildInternalPageSections(): ContentSection[] {
  return INTERNAL_PAGES.map(({ slug, label }) => ({
    id: `page-${slug}`,
    title: label,
    description: `Edite tudo da página /${slug}: textos, imagens, galeria e vídeos.`,
    group: "Páginas" as const,
    previewPath: `/${slug}`,
    fields: [
      { key: `page.${slug}.eyebrow`, label: "Etiqueta superior", hint: "Pequeno texto acima do título do hero." },
      { key: `page.${slug}.title`, label: "Título da página", hint: "Título principal exibido no hero." },
      { key: `page.${slug}.subtitle`, label: "Subtítulo", kind: "textarea", hint: "Frase de apoio logo abaixo do título." },
      { key: `page.${slug}.hero_image`, label: "Imagem do hero", kind: "media", mediaKinds: ["image"], hint: "Imagem cinematográfica de fundo do topo da página." },
      { key: `page.${slug}.intro`, label: "Texto de abertura", kind: "textarea", hint: "Aparece logo após o hero, em destaque." },
      { key: `page.${slug}.content`, label: "Conteúdo completo", kind: "textarea", hint: "Texto corrido da página. Use Enter para separar parágrafos." },
      { key: `page.${slug}.gallery_tag`, label: "Tag da galeria", hint: `Padrão: "${slug}". Marque as imagens com esta tag na Mídia para aparecerem aqui.` },
      { key: `page.${slug}.videos_tag`, label: "Tag dos vídeos", hint: `Padrão: "${slug}". Marque os vídeos com esta tag na Mídia.` },
      { key: `page.${slug}.cta_title`, label: "CTA — Título", hint: "Bloco de chamada antes do formulário." },
      { key: `page.${slug}.cta_subtitle`, label: "CTA — Subtítulo", kind: "textarea" },
      { key: `page.${slug}.cta_label`, label: "CTA — Texto do botão" },
      { key: `page.${slug}.seo_title`, label: "SEO — Title", hint: "Aparece na aba do navegador e no Google." },
      { key: `page.${slug}.seo_description`, label: "SEO — Meta description", kind: "textarea", hint: "Resumo curto exibido nos resultados de busca." },
    ],
  }));
}

export const SECTIONS: ContentSection[] = [
  {
    id: "seo",
    title: "SEO & Compartilhamento",
    description: "Como o site aparece no Google e em redes sociais.",
    group: "Geral",
    previewPath: "/",
    fields: [
      { key: "seo.title", label: "Título da página (title)", hint: "Aparece na aba do navegador e no Google." },
      { key: "seo.description", label: "Meta descrição", kind: "textarea", hint: "Resumo de 1–2 linhas exibido nos buscadores." },
      { key: "seo.og_title", label: "Título ao compartilhar (og:title)", hint: "Usado no WhatsApp, Facebook, LinkedIn." },
      { key: "seo.og_description", label: "Descrição ao compartilhar", kind: "textarea" },
    ],
  },
  {
    id: "navbar",
    title: "Menu / Topo",
    description: "Barra superior fixa do site.",
    group: "Home",
    previewPath: "/",
    fields: [{ key: "navbar.cta", label: "Texto do botão do topo", hint: "Ex.: AGENDAR VISITA" }],
  },
  {
    id: "hero",
    title: "Hero (capa da home)",
    description: "Primeira tela do site — vídeo ou imagem cinematográfica.",
    group: "Home",
    previewPath: "/",
    fields: [
      { key: "hero.eyebrow", label: "Etiqueta superior", hint: "Pequeno texto acima do título." },
      { key: "hero.kicker", label: "Subtítulo pequeno" },
      { key: "hero.title_line1", label: "Título — linha 1" },
      { key: "hero.title_line2", label: "Título — linha 2 (destaque dourado)" },
      { key: "hero.subtitle", label: "Subtítulo", kind: "textarea", hint: "Use Enter para nova linha." },
      { key: "hero.cta", label: "Texto do botão" },
      { key: "hero.video_url", label: "Vídeo (desktop)", kind: "media", mediaKinds: ["video"], hint: "Vídeo cinematográfico de fundo. Deixe vazio para usar imagem." },
      { key: "hero.video_url_mobile", label: "Vídeo (mobile, opcional)", kind: "media", mediaKinds: ["video"], hint: "Versão otimizada para celular." },
      { key: "hero.video_poster", label: "Poster / imagem de fundo", kind: "media", mediaKinds: ["image"], hint: "Aparece antes do vídeo carregar e como fallback." },
      { key: "hero.video_autoplay", label: "Autoplay", hint: 'Digite "true" ou "false".' },
      { key: "hero.video_loop", label: "Loop infinito", hint: 'Digite "true" ou "false".' },
    ],
  },
  {
    id: "visit",
    title: "Formulário de Agendamento de Visita",
    description: "Bloco de captura de leads — agendamento de visita à central de vendas.",
    group: "Home",
    previewPath: "/",
    fields: [
      { key: "visit.eyebrow", label: "Etiqueta" },
      { key: "visit.title", label: "Título" },
      { key: "visit.subtitle", label: "Subtítulo", kind: "textarea" },
      { key: "visit.cta", label: "Texto do botão" },
      { key: "visit.contact_name", label: "Nome do contato", hint: "Pessoa responsável exibida abaixo do formulário." },
      { key: "visit.contact_phone_display", label: "Telefone exibido" },
    ],
  },
  ...buildInternalPageSections(),
  {
    id: "contact",
    title: "Contato & Redes Sociais",
    description: "Usado em todo o site (WhatsApp flutuante, rodapé, links sociais).",
    group: "Geral",
    previewPath: "/",
    fields: [
      { key: "contact.whatsapp", label: "WhatsApp (somente números, com DDI)", kind: "tel", hint: "Ex.: 5547988178508" },
      { key: "contact.instagram", label: "Instagram (URL completa)", kind: "url" },
      { key: "contact.facebook", label: "Facebook (URL completa)", kind: "url" },
    ],
  },
  {
    id: "footer",
    title: "Rodapé",
    description: "Aparece no final de todas as páginas.",
    group: "Geral",
    previewPath: "/",
    fields: [
      { key: "footer.realizacao_label", label: "Etiqueta acima das logos" },
      { key: "footer.city", label: "Cidade / Estado" },
      { key: "footer.phone", label: "Telefone exibido" },
    ],
  },
];

const GROUP_ORDER: ContentSection["group"][] = ["Home", "Páginas", "Geral"];

export function ContentEditor() {
  const { data, isLoading } = useSiteContent();
  const [activeId, setActiveId] = useState<string>("hero");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"Todas" | ContentSection["group"]>("Todas");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSections = useMemo(() => {
    if (!normalizedSearch && activeFilter === "Todas") return SECTIONS;
    return SECTIONS.filter((s) => {
      const matchesGroup = activeFilter === "Todas" || s.group === activeFilter;
      if (!normalizedSearch) return matchesGroup;
      const inTitle = s.title.toLowerCase().includes(normalizedSearch);
      const inDesc = (s.description ?? "").toLowerCase().includes(normalizedSearch);
      const inFields = s.fields.some(
        (f) =>
          f.label.toLowerCase().includes(normalizedSearch) ||
          (f.hint ?? "").toLowerCase().includes(normalizedSearch) ||
          f.key.toLowerCase().includes(normalizedSearch)
      );
      return matchesGroup && (inTitle || inDesc || inFields);
    });
  }, [normalizedSearch, activeFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, ContentSection[]> = {};
    for (const s of filteredSections) {
      (g[s.group] = g[s.group] ?? []).push(s);
    }
    return g;
  }, [filteredSections]);

  const active = SECTIONS.find((s) => s.id === activeId) ?? SECTIONS[0];

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-3xl text-offwhite">Editar Site</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Selecione uma seção à esquerda, edite os campos no centro e acompanhe o resultado em tempo real à direita.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Sidebar de seções com busca e filtros */}
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-160px)] lg:overflow-y-auto">
          {/* Busca */}
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar seção, campo..."
              className="w-full rounded border border-border bg-background py-2 pl-8 pr-8 text-xs text-offwhite outline-none focus:border-gold"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-offwhite"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filtros por grupo */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {(["Todas", "Home", "Páginas", "Geral"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`rounded px-2 py-1 text-[10px] tracking-luxe transition-colors ${
                  activeFilter === f
                    ? "bg-gold/20 text-gold"
                    : "border border-border text-muted-foreground hover:text-offwhite"
                }`}
              >
                {f === "Todas" ? "TODAS" : f.toUpperCase()}
                {f !== "Todas" && (
                  <span className="ml-1 opacity-70">({grouped[f]?.length ?? 0})</span>
                )}
              </button>
            ))}
          </div>

          {/* Resultados */}
          {filteredSections.length === 0 ? (
            <p className="py-6 text-center text-[11px] text-muted-foreground">
              Nenhuma seção encontrada.
            </p>
          ) : (
            <nav className="space-y-5 pr-1">
              {GROUP_ORDER.map((group) => {
                const items = grouped[group] ?? [];
                if (items.length === 0) return null;
                return (
                  <div key={group}>
                    <div className="mb-2 text-[10px] tracking-luxe text-gold/70">{group.toUpperCase()}</div>
                    <ul className="space-y-1">
                      {items.map((s) => (
                        <li key={s.id}>
                          <button
                            onClick={() => setActiveId(s.id)}
                            className={`w-full rounded px-3 py-2 text-left text-xs transition-colors ${
                              activeId === s.id
                                ? "bg-gold/10 text-gold"
                                : "text-muted-foreground hover:bg-card hover:text-offwhite"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{highlightMatch(s.title, normalizedSearch)}</span>
                              {activeId === s.id && (
                                <span className="ml-1.5 inline-block h-1 w-1 rounded-full bg-gold" />
                              )}
                            </div>
                            {s.description && (
                              <p className="mt-0.5 truncate text-[10px] text-muted-foreground/70">
                                {highlightMatch(s.description, normalizedSearch)}
                              </p>
                            )}
                            {normalizedSearch && getMatchingFieldLabels(s, normalizedSearch).length > 0 && (
                              <p className="mt-1 text-[9px] text-gold/70">
                                Campos: {getMatchingFieldLabels(s, normalizedSearch).join(", ")}
                              </p>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          )}
        </aside>

        {/* Editor de campos */}
        <section className="min-w-0">
          <div className="mb-5 rounded border border-border bg-card/40 p-4">
            <div className="text-sm text-offwhite">{active.title}</div>
            {active.description && (
              <p className="mt-1 text-[11px] text-muted-foreground">{active.description}</p>
            )}
            <div className="mt-2 text-[10px] tracking-luxe text-muted-foreground/70">
              Visualizando: <span className="text-gold/80">{active.previewPath}</span>
            </div>
          </div>
          <div className="space-y-5">
            {active.fields.map((f) => (
              <FieldRow
                key={f.key}
                field={f}
                value={typeof data?.[f.key] === "string" ? (data[f.key] as string) : ""}
              />
            ))}
          </div>
        </section>

        {/* Preview ao vivo */}
        <aside className="hidden lg:block">
          <LivePreview path={active.previewPath} heightOffset={220} />
        </aside>
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-gold/30 px-0.5 text-offwhite">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMatchingFieldLabels(section: ContentSection, query: string) {
  return section.fields
    .filter(
      (f) =>
        f.label.toLowerCase().includes(query) ||
        (f.hint ?? "").toLowerCase().includes(query) ||
        f.key.toLowerCase().includes(query)
    )
    .map((f) => f.label)
    .slice(0, 3);
}

export function FieldRow({ field, value }: { field: ContentField; value: string }) {
  const [val, setVal] = useState(value);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<number | null>(null);
  const lastSaved = useRef(value);

  useEffect(() => {
    if (value !== lastSaved.current) {
      setVal(value);
      lastSaved.current = value;
    }
  }, [value]);

  const save = async (next: string) => {
    setStatus("saving");
    const { error } = await supabase
      .from("site_content")
      .upsert({ key: field.key, value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      setStatus("error");
      return;
    }
    lastSaved.current = next;
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1200);
  };

  const onChange = (v: string) => {
    setVal(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(v), 600);
  };

  const kind = field.kind ?? "text";

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-[10px] tracking-luxe text-muted-foreground">{field.label}</label>
        <span className="text-[9px] tracking-luxe text-muted-foreground/60">
          {status === "saving" && "salvando..."}
          {status === "saved" && "✓ salvo"}
          {status === "error" && "erro"}
        </span>
      </div>
      {kind === "media" ? (
        <div className="mt-2">
          <MediaPicker value={val} onChange={onChange} kinds={field.mediaKinds ?? ["image", "video"]} />
        </div>
      ) : kind === "textarea" ? (
        <textarea
          value={val}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
        />
      ) : (
        <input
          type={kind === "url" ? "url" : kind === "tel" ? "tel" : "text"}
          value={val}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
        />
      )}
      {field.hint && <p className="mt-1 text-[10px] text-muted-foreground/70">{field.hint}</p>}
    </div>
  );
}
