import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePartnerLogos, type PartnerLogoWithUrl, type LogoCategory } from "@/hooks/use-partner-logos";
import { useSiteContent } from "@/hooks/use-site-content";
import { toWebpIfRaster } from "@/lib/img-to-webp";

const CATEGORIES: { id: LogoCategory; title: string }[] = [
  { id: "realizacao", title: "REALIZAÇÃO" },
  { id: "apoio", title: "APOIO" },
];

export function LogosPanel() {
  const { data: logos, isLoading } = usePartnerLogos();
  const { data: content } = useSiteContent();
  const qc = useQueryClient();

  const setting = (k: string, fb: string) => {
    const v = content?.[k];
    return typeof v === "string" ? v : fb;
  };
  const saveSetting = async (k: string, v: string) => {
    await supabase
      .from("site_content")
      .upsert({ key: k, value: v, updated_at: new Date().toISOString() }, { onConflict: "key" });
  };

  type LogoPatch = Partial<{
    alt: string | null;
    link: string | null;
    sort_order: number;
    active: boolean;
    placement: string;
    category: LogoCategory;
  }>;
  const updateRow = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: LogoPatch }) => {
      const { error } = await supabase.from("partner_logos").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner-logos"] }),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("partner_logos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["partner-logos"] }),
  });

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Logos & Parceiros</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Organize por categoria. A logo principal é gerenciada na aba <strong>Mídia</strong>.
        </p>
      </div>

      <div className="mb-8 grid gap-4 rounded border border-border bg-card p-5 md:grid-cols-4">
        <SmallNumber label="Colunas (desktop)" k="logos.cols_desktop" defaultV="3" current={setting} save={saveSetting} />
        <SmallNumber label="Colunas (mobile)" k="logos.cols_mobile" defaultV="2" current={setting} save={saveSetting} />
        <SmallNumber label="Altura (px)" k="logos.height" defaultV="40" current={setting} save={saveSetting} />
        <SmallNumber label="Espaçamento (px)" k="logos.gap" defaultV="48" current={setting} save={saveSetting} />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {CATEGORIES.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat.id}
          title={cat.title}
          logos={(logos ?? []).filter((l) => l.category === cat.id)}
          onUpdate={(id, patch) => updateRow.mutate({ id, patch })}
          onRemove={(id) => remove.mutate(id)}
          existingCount={logos?.length ?? 0}
        />
      ))}
    </div>
  );
}

function CategorySection({
  category,
  title,
  logos,
  onUpdate,
  onRemove,
  existingCount,
}: {
  category: LogoCategory;
  title: string;
  logos: PartnerLogoWithUrl[];
  onUpdate: (id: string, patch: Partial<{ alt: string | null; link: string | null; sort_order: number; active: boolean; category: LogoCategory }>) => void;
  onRemove: (id: string) => void;
  existingCount: number;
}) {
  const qc = useQueryClient();
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      if (file.size > 20 * 1024 * 1024) throw new Error("Logo muito grande (máx 20MB)");
      const optimized = await toWebpIfRaster(file, 0.92, 1600);
      const ext = optimized.name.split(".").pop()?.toLowerCase() ?? "webp";
      const path = `partner-logo-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const up = await supabase.storage.from("site-assets").upload(path, optimized, { upsert: false });
      if (up.error) throw up.error;
      const { error } = await supabase.from("partner_logos").insert({
        storage_path: path,
        sort_order: existingCount + 1,
        active: true,
        placement: "footer",
        category,
        alt: file.name.replace(/\.[^.]+$/, ""),
      });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["partner-logos"] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
    } finally {
      setBusy(false);
    }
  };

  const move = (id: string, dir: -1 | 1) => {
    const idx = logos.findIndex((l) => l.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= logos.length) return;
    const a = logos[idx];
    const b = logos[target];
    onUpdate(a.id, { sort_order: b.sort_order });
    onUpdate(b.id, { sort_order: a.sort_order });
  };

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[11px] tracking-luxe text-gold">{title}</h3>
        <span className="text-[10px] tracking-luxe text-muted-foreground">{logos.length} logo(s)</span>
      </div>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          Array.from(e.dataTransfer.files).forEach((f) => upload(f));
        }}
        className={`flex h-28 cursor-pointer items-center justify-center rounded border-2 border-dashed transition-colors ${
          drag ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
        }`}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => Array.from(e.target.files ?? []).forEach((f) => upload(f))}
        />
        <span className="text-[10px] tracking-luxe text-muted-foreground">
          {busy ? "ENVIANDO..." : `ADICIONAR LOGOS A ${title}`}
        </span>
      </label>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {logos.map((l, i) => (
          <div key={l.id} className="glass-card p-4">
            <div className="flex h-20 items-center justify-center rounded bg-background">
              <img src={l.url} alt={l.alt ?? ""} className="max-h-16 object-contain" />
            </div>
            <input
              defaultValue={l.alt ?? ""}
              placeholder="Nome / alt"
              onBlur={(e) => e.target.value !== (l.alt ?? "") && onUpdate(l.id, { alt: e.target.value })}
              className="mt-3 w-full rounded border border-border bg-background px-2 py-1 text-xs text-offwhite outline-none focus:border-gold"
            />
            <input
              defaultValue={l.link ?? ""}
              placeholder="Link (opcional)"
              onBlur={(e) =>
                e.target.value !== (l.link ?? "") && onUpdate(l.id, { link: e.target.value || null })
              }
              className="mt-2 w-full rounded border border-border bg-background px-2 py-1 text-xs text-offwhite outline-none focus:border-gold"
            />
            <select
              value={l.category}
              onChange={(e) => onUpdate(l.id, { category: e.target.value as LogoCategory })}
              className="mt-2 w-full rounded border border-border bg-background px-2 py-1 text-xs text-offwhite outline-none focus:border-gold"
            >
              <option value="realizacao">Realização</option>
              <option value="apoio">Apoio</option>
            </select>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <button
                  onClick={() => move(l.id, -1)}
                  disabled={i === 0}
                  className="rounded border border-border px-2 py-1 text-xs text-offwhite/70 hover:text-gold disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => move(l.id, 1)}
                  disabled={i === logos.length - 1}
                  className="rounded border border-border px-2 py-1 text-xs text-offwhite/70 hover:text-gold disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <label className="flex items-center gap-2 text-[10px] tracking-luxe text-muted-foreground">
                <input
                  type="checkbox"
                  checked={l.active}
                  onChange={(e) => onUpdate(l.id, { active: e.target.checked })}
                />
                ATIVO
              </label>
              <button
                onClick={() => confirm("Remover esta logo?") && onRemove(l.id)}
                className="text-[10px] tracking-luxe text-muted-foreground hover:text-destructive"
              >
                REMOVER
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SmallNumber({
  label,
  k,
  defaultV,
  current,
  save,
}: {
  label: string;
  k: string;
  defaultV: string;
  current: (k: string, fb: string) => string;
  save: (k: string, v: string) => Promise<void>;
}) {
  const v = current(k, defaultV);
  return (
    <label className="block">
      <span className="text-[10px] tracking-luxe text-muted-foreground">{label}</span>
      <input
        type="number"
        defaultValue={v}
        key={v}
        onBlur={(e) => e.target.value !== v && save(k, e.target.value)}
        className="mt-1 w-full rounded border border-border bg-background px-2 py-1 text-sm text-offwhite outline-none focus:border-gold"
      />
    </label>
  );
}
