import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { MediaKind } from "@/hooks/use-media-library";

type FieldKind = "text" | "textarea" | "url" | "datetime" | "tel" | "media";

export interface ContentField {
  key: string;
  label: string;
  kind?: FieldKind;
  hint?: string;
  mediaKinds?: MediaKind[];
}

export interface ContentField {
  key: string;
  label: string;
  kind?: FieldKind;
  hint?: string;
}

export interface ContentSection {
  id: string;
  title: string;
  description?: string;
  fields: ContentField[];
}

export const SECTIONS: ContentSection[] = [
  {
    id: "seo",
    title: "SEO & Compartilhamento",
    description: "Como o site aparece no Google e em redes sociais.",
    fields: [
      { key: "seo.title", label: "Título da página (title)" },
      { key: "seo.description", label: "Meta descrição", kind: "textarea" },
      { key: "seo.og_title", label: "Título ao compartilhar (og:title)" },
      { key: "seo.og_description", label: "Descrição ao compartilhar", kind: "textarea" },
    ],
  },
  {
    id: "navbar",
    title: "Menu / Topo",
    fields: [{ key: "navbar.cta", label: "Texto do botão do topo" }],
  },
  {
    id: "hero",
    title: "Hero (capa)",
    description: "Imagem ou vídeo cinematográfico de fundo. Mídia editável na aba Mídia ou pelos campos de URL abaixo.",
    fields: [
      { key: "hero.eyebrow", label: "Etiqueta superior" },
      { key: "hero.kicker", label: "Subtítulo pequeno" },
      { key: "hero.title_line1", label: "Título — linha 1" },
      { key: "hero.title_line2", label: "Título — linha 2 (destaque dourado)" },
      { key: "hero.subtitle", label: "Subtítulo (use Enter para nova linha)", kind: "textarea" },
      { key: "hero.cta", label: "Texto do botão" },
      { key: "hero.video_url", label: "Vídeo (desktop)", kind: "media", mediaKinds: ["video"], hint: "Selecione um vídeo da biblioteca ou deixe vazio para usar imagem." },
      { key: "hero.video_url_mobile", label: "Vídeo (mobile, opcional)", kind: "media", mediaKinds: ["video"] },
      { key: "hero.video_poster", label: "Poster / imagem de fundo", kind: "media", mediaKinds: ["image"], hint: "Aparece antes do vídeo carregar e como fallback." },
      { key: "hero.video_autoplay", label: "Autoplay (true / false)" },
      { key: "hero.video_loop", label: "Loop infinito (true / false)" },
    ],
  },
  {
    id: "countdown",
    title: "Contador regressivo",
    fields: [
      { key: "countdown.eyebrow", label: "Etiqueta" },
      { key: "countdown.title", label: "Título" },
      { key: "countdown.target_date", label: "Data alvo (ISO)", kind: "datetime", hint: "Ex.: 2026-05-16T10:00:00-03:00" },
    ],
  },
  {
    id: "marco",
    title: "Seção 'Um novo marco'",
    fields: [
      { key: "marco.eyebrow", label: "Etiqueta" },
      { key: "marco.title", label: "Título", kind: "textarea" },
      { key: "marco.p1", label: "Parágrafo 1", kind: "textarea" },
      { key: "marco.p2", label: "Parágrafo 2", kind: "textarea" },
      { key: "marco.quote", label: "Citação final", kind: "textarea" },
    ],
  },
  {
    id: "experience",
    title: "Seção 'A Experiência'",
    fields: [
      { key: "experience.eyebrow", label: "Etiqueta" },
      { key: "experience.title", label: "Título", kind: "textarea" },
      { key: "experience.item1_title", label: "Item 1 — Título" },
      { key: "experience.item1_text", label: "Item 1 — Texto", kind: "textarea" },
      { key: "experience.item2_title", label: "Item 2 — Título" },
      { key: "experience.item2_text", label: "Item 2 — Texto", kind: "textarea" },
      { key: "experience.item3_title", label: "Item 3 — Título" },
      { key: "experience.item3_text", label: "Item 3 — Texto", kind: "textarea" },
      { key: "experience.item4_title", label: "Item 4 — Título" },
      { key: "experience.item4_text", label: "Item 4 — Texto", kind: "textarea" },
    ],
  },
  {
    id: "info",
    title: "Seção Informações (Local / Data / Horário)",
    fields: [
      { key: "info.eyebrow", label: "Etiqueta" },
      { key: "info.local_title", label: "Local — Título" },
      { key: "info.local_sub", label: "Local — Endereço", kind: "textarea" },
      { key: "info.date_title", label: "Data — Título" },
      { key: "info.date_sub", label: "Data — Subtítulo" },
      { key: "info.time_title", label: "Horário — Título" },
      { key: "info.time_sub", label: "Horário — Subtítulo" },
    ],
  },
  {
    id: "vagas",
    title: "Seção 'Vagas Limitadas'",
    fields: [
      { key: "vagas.badge", label: "Selo" },
      { key: "vagas.title", label: "Título", kind: "textarea" },
      { key: "vagas.sub", label: "Subtítulo" },
    ],
  },
  {
    id: "confirm",
    title: "Formulário de Confirmação",
    fields: [
      { key: "confirm.eyebrow", label: "Etiqueta" },
      { key: "confirm.title", label: "Título" },
      { key: "confirm.subtitle", label: "Subtítulo", kind: "textarea" },
      { key: "confirm.cta", label: "Texto do botão" },
      { key: "confirm.contact_name", label: "Nome do contato" },
      { key: "confirm.contact_phone_display", label: "Telefone exibido" },
    ],
  },
  {
    id: "contact",
    title: "Contato & Redes Sociais",
    fields: [
      { key: "contact.whatsapp", label: "WhatsApp (somente números, com DDI)", kind: "tel", hint: "Ex.: 5547988178508" },
      { key: "contact.instagram", label: "Instagram (URL completa)", kind: "url" },
      { key: "contact.facebook", label: "Facebook (URL completa)", kind: "url" },
    ],
  },
  {
    id: "footer",
    title: "Rodapé",
    fields: [
      { key: "footer.realizacao_label", label: "Etiqueta acima das logos" },
      { key: "footer.city", label: "Cidade / Estado" },
      { key: "footer.phone", label: "Telefone exibido" },
    ],
  },
];

export function ContentEditor() {
  const { data, isLoading } = useSiteContent();
  const [openId, setOpenId] = useState<string>("hero");

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Editar Site</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Toda alteração é salva automaticamente e atualiza o site em tempo real.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <div key={s.id} className="overflow-hidden rounded border border-border">
            <button
              onClick={() => setOpenId(openId === s.id ? "" : s.id)}
              className="flex w-full items-center justify-between bg-card px-5 py-4 text-left transition-colors hover:bg-card/70"
            >
              <div>
                <div className="text-sm text-offwhite">{s.title}</div>
                {s.description && (
                  <div className="mt-1 text-[11px] text-muted-foreground">{s.description}</div>
                )}
              </div>
              <span className="text-gold">{openId === s.id ? "−" : "+"}</span>
            </button>
            {openId === s.id && (
              <div className="space-y-5 border-t border-border bg-background/50 p-5">
                {s.fields.map((f) => (
                  <FieldRow
                    key={f.key}
                    field={f}
                    value={typeof data?.[f.key] === "string" ? (data[f.key] as string) : ""}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldRow({ field, value }: { field: ContentField; value: string }) {
  const [val, setVal] = useState(value);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<number | null>(null);
  const lastSaved = useRef(value);

  useEffect(() => {
    // Sincroniza se vier mudança via realtime (ex.: outro usuário)
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
          type={kind === "url" ? "url" : kind === "tel" ? "tel" : kind === "datetime" ? "text" : "text"}
          value={val}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
        />
      )}
      {field.hint && <p className="mt-1 text-[10px] text-muted-foreground/70">{field.hint}</p>}
    </div>
  );
}
