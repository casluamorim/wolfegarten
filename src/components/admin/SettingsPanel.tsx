import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";
import { PartnersPanel } from "./PartnersPanel";

interface Field {
  key: string;
  label: string;
  hint?: string;
  textarea?: boolean;
}
interface Group {
  id: string;
  title: string;
  description?: string;
  fields: Field[];
}

const GROUPS: Group[] = [
  {
    id: "contact",
    title: "Contato & Redes Sociais",
    fields: [
      {
        key: "contact.whatsapp",
        label: "WhatsApp (somente números, com DDI)",
        hint: "Ex.: 5547988178508",
      },
      { key: "contact.instagram", label: "Instagram (URL completa)" },
      { key: "contact.facebook", label: "Facebook (URL completa)" },
      { key: "contact.email", label: "E-mail de contato" },
    ],
  },
  {
    id: "seoglobal",
    title: "SEO Global & Tracking",
    description: "Códigos de analytics e configurações globais.",
    fields: [
      { key: "tracking.ga4_id", label: "Google Analytics ID (G-XXXXXX)" },
      { key: "tracking.meta_pixel_id", label: "Meta Pixel ID" },
      { key: "seo.canonical", label: "URL canônica do site" },
    ],
  },
  {
    id: "institucional",
    title: "Informações institucionais",
    fields: [
      { key: "footer.realizacao_label", label: "Etiqueta acima das logos do rodapé" },
      { key: "footer.city", label: "Cidade / Estado (rodapé)" },
      { key: "footer.phone", label: "Telefone exibido no rodapé" },
    ],
  },
];

export function SettingsPanel() {
  const { data, isLoading } = useSiteContent();
  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Configurações</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Redes sociais, contato, tracking e parceiros.
        </p>
      </div>

      <div className="space-y-6">
        {GROUPS.map((g) => (
          <div key={g.id} className="rounded border border-border bg-card/40 p-5">
            <h3 className="text-sm text-offwhite">{g.title}</h3>
            {g.description && (
              <p className="mt-1 text-[11px] text-muted-foreground">{g.description}</p>
            )}
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {g.fields.map((f) => (
                <Field
                  key={f.key}
                  field={f}
                  value={typeof data?.[f.key] === "string" ? (data[f.key] as string) : ""}
                />
              ))}
            </div>
          </div>
        ))}

        <PartnersPanel />
      </div>
    </div>
  );
}

function Field({ field, value }: { field: Field; value: string }) {
  const [val, setVal] = useState(value);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const t = useRef<number | null>(null);
  const last = useRef(value);

  useEffect(() => {
    if (value !== last.current) {
      setVal(value);
      last.current = value;
    }
  }, [value]);

  const save = async (next: string) => {
    const { error } = await supabase
      .from("site_content")
      .upsert(
        { key: field.key, value: next, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (error) setStatus("error");
    else {
      last.current = next;
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1200);
    }
  };

  const onChange = (v: string) => {
    setVal(v);
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => save(v), 600);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-[10px] tracking-luxe text-muted-foreground">{field.label}</label>
        <span className="text-[9px] tracking-luxe text-muted-foreground/60">
          {status === "saved" && "✓ salvo"}
          {status === "error" && "erro"}
        </span>
      </div>
      {field.textarea ? (
        <textarea
          value={val}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
        />
      ) : (
        <input
          value={val}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
        />
      )}
      {field.hint && <p className="mt-1 text-[10px] text-muted-foreground/70">{field.hint}</p>}
    </div>
  );
}
