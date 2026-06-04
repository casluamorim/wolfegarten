import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";

interface F {
  key: string;
  label: string;
  kind?: "text" | "url" | "tel" | "textarea";
  hint?: string;
}
interface S {
  id: string;
  title: string;
  description?: string;
  fields: F[];
}

const SECTIONS: S[] = [
  {
    id: "social",
    title: "Redes Sociais",
    description: "URLs completas. Deixe em branco para esconder o ícone.",
    fields: [
      { key: "social.instagram", label: "Instagram", kind: "url" },
      { key: "social.facebook", label: "Facebook", kind: "url" },
      { key: "social.linkedin", label: "LinkedIn", kind: "url" },
      { key: "social.youtube", label: "YouTube", kind: "url" },
      { key: "social.tiktok", label: "TikTok", kind: "url" },
      { key: "social.whatsapp", label: "WhatsApp (link wa.me, opcional)", kind: "url", hint: "Se vazio, usa o número de Contato." },
    ],
  },
  {
    id: "contact",
    title: "Contato",
    fields: [
      { key: "contact.whatsapp", label: "WhatsApp (DDI+DDD+número)", kind: "tel", hint: "Ex.: 5547988178508" },
      { key: "contact.phone", label: "Telefone exibido" },
      { key: "contact.email", label: "E-mail" },
      { key: "contact.address", label: "Endereço / Cidade (rodapé)", kind: "textarea" },
    ],
  },
  {
    id: "sales",
    title: "Central de Vendas",
    description:
      "Endereço e mapa exibidos nas páginas internas e na home. Use o campo de embed do Google Maps para um mapa preciso.",
    fields: [
      { key: "sales.label", label: "Nome exibido", hint: "Ex.: Central de Vendas Wölfegarten" },
      { key: "sales.address", label: "Endereço completo", kind: "textarea", hint: "Ex.: Rua das Palmeiras, 123 — Centro, Indaial/SC" },
      {
        key: "sales.map_embed",
        label: "URL de embed do Google Maps (opcional)",
        kind: "url",
        hint: "No Google Maps: Compartilhar → Incorporar um mapa → copie a URL dentro de src=\"...\". Se vazio, o mapa usa o endereço acima.",
      },
      { key: "sales.hours", label: "Horário de atendimento", hint: "Ex.: Seg–Sex 9h–18h · Sáb 9h–13h" },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Pixel",
    description: "Os scripts são injetados automaticamente quando preenchidos.",
    fields: [
      { key: "analytics.ga4_id", label: "ID do Google Analytics 4", hint: "Ex.: G-ABC123" },
      { key: "analytics.meta_pixel_id", label: "ID do Meta Pixel", hint: "Ex.: 1234567890" },
    ],
  },
  {
    id: "launch",
    title: "Fase de Lançamento",
    description:
      "Em pré-lançamento o site mostra o convite. Quando 'Trocar automaticamente' está ativo, o site vira institucional ao chegar a data do contador.",
    fields: [
      {
        key: "launch.phase",
        label: "Fase forçada (pre / live / auto)",
        hint: "Use 'auto' (deixe vazio ou 'pre' com auto-troca ativada) para deixar a data decidir.",
      },
      { key: "launch.auto_switch", label: "Trocar automaticamente na data (true / false)" },
    ],
  },
  {
    id: "institutional",
    title: "Dados Institucionais",
    fields: [
      { key: "institutional.razao_social", label: "Razão Social" },
      { key: "institutional.cnpj", label: "CNPJ" },
    ],
  },
];

export function SettingsPanel() {
  const { data, isLoading } = useSiteContent();
  const [openId, setOpenId] = useState<string>("social");

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Configurações</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Redes sociais, contato, scripts de analytics e dados institucionais. Tudo é salvo automaticamente.
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
                  <Field
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

function Field({ field, value }: { field: F; value: string }) {
  const [val, setVal] = useState(value);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const timer = useRef<number | null>(null);
  const last = useRef(value);

  useEffect(() => {
    if (value !== last.current) {
      setVal(value);
      last.current = value;
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
    last.current = next;
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1200);
  };

  const onChange = (v: string) => {
    setVal(v);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(v), 500);
  };

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
      {field.kind === "textarea" ? (
        <textarea
          value={val}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
        />
      ) : (
        <input
          type={field.kind === "url" ? "url" : field.kind === "tel" ? "tel" : "text"}
          value={val}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
        />
      )}
      {field.hint && <p className="mt-1 text-[10px] text-muted-foreground/70">{field.hint}</p>}
    </div>
  );
}
