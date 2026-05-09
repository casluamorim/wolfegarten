import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePartnerLogos } from "@/hooks/use-partner-logos";
import { useSiteContent } from "@/hooks/use-site-content";

export function LogosPanel() {
  const { data: logos, isLoading } = usePartnerLogos();
  const { data: content } = useSiteContent();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      if (file.size > 4 * 1024 * 1024) throw new Error("Máx 4MB");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const path = `partner-logo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const up = await supabase.storage.from("site-assets").upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const nextOrder = (logos?.length ?? 0) + 1;
      const { error } = await supabase.from("partner_logos").insert({
        storage_path: path,
        sort_order: nextOrder,
        active: true,
        placement: "footer",
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

  const updateRow = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
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

  const move = (id: string, dir: -1 | 1) => {
    if (!logos) return;
    const idx = logos.findIndex((l) => l.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= logos.length) return;
    const a = logos[idx];
    const b = logos[target];
    updateRow.mutate({ id: a.id, patch: { sort_order: b.sort_order } });
    updateRow.mutate({ id: b.id, patch: { sort_order: a.sort_order } });
  };

  const setting = (k: string, fb: string) => {
    const v = content?.[k];
    return typeof v === "string" ? v : fb;
  };

  const saveSetting = async (k: string, v: string) => {
    await supabase
      .from("site_content")
      .upsert({ key: k, value: v, updated_at: new Date().toISOString() }, { onConflict: "key" });
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Logos & Parceiros</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Adicione, ordene e ative/desative livremente. A logo principal do empreendimento é gerenciada na aba <strong>Mídia</strong>.
        </p>
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
          const files = Array.from(e.dataTransfer.files);
          files.forEach((f) => upload(f));
        }}
        className={`flex h-32 cursor-pointer items-center justify-center rounded border-2 border-dashed transition-colors ${
          drag ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
        }`}
      >
        <input
          type="file"
          accept="image/png,image/svg+xml,image/webp"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            files.forEach((f) => upload(f));
          }}
        />
        <span className="text-[10px] tracking-luxe text-muted-foreground">
          {busy ? "ENVIANDO..." : "ARRASTE LOGOS PNG/SVG OU CLIQUE"}
        </span>
      </label>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

      {/* Layout settings */}
      <div className="mt-8 grid gap-4 rounded border border-border bg-card p-5 md:grid-cols-4">
        <SmallNumber label="Colunas (desktop)" k="logos.cols_desktop" defaultV="3" current={setting} save={saveSetting} />
        <SmallNumber label="Colunas (mobile)" k="logos.cols_mobile" defaultV="2" current={setting} save={saveSetting} />
        <SmallNumber label="Altura (px)" k="logos.height" defaultV="40" current={setting} save={saveSetting} />
        <SmallNumber label="Espaçamento (px)" k="logos.gap" defaultV="48" current={setting} save={saveSetting} />
      </div>

      {/* Lista */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {logos?.map((l, i) => (
          <div key={l.id} className="glass-card p-4">
            <div className="flex h-24 items-center justify-center rounded bg-background">
              <img src={l.url} alt={l.alt ?? ""} className="max-h-20 object-contain" />
            </div>
            <input
              defaultValue={l.alt ?? ""}
              placeholder="Nome / alt"
              onBlur={(e) =>
                e.target.value !== (l.alt ?? "") &&
                updateRow.mutate({ id: l.id, patch: { alt: e.target.value } })
              }
              className="mt-3 w-full rounded border border-border bg-background px-2 py-1 text-xs text-offwhite outline-none focus:border-gold"
            />
            <input
              defaultValue={l.link ?? ""}
              placeholder="Link (opcional)"
              onBlur={(e) =>
                e.target.value !== (l.link ?? "") &&
                updateRow.mutate({ id: l.id, patch: { link: e.target.value || null } })
              }
              className="mt-2 w-full rounded border border-border bg-background px-2 py-1 text-xs text-offwhite outline-none focus:border-gold"
            />
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
                  disabled={i === (logos?.length ?? 0) - 1}
                  className="rounded border border-border px-2 py-1 text-xs text-offwhite/70 hover:text-gold disabled:opacity-30"
                >
                  ↓
                </button>
              </div>
              <label className="flex items-center gap-2 text-[10px] tracking-luxe text-muted-foreground">
                <input
                  type="checkbox"
                  checked={l.active}
                  onChange={(e) => updateRow.mutate({ id: l.id, patch: { active: e.target.checked } })}
                />
                ATIVO
              </label>
              <button
                onClick={() => confirm("Remover esta logo?") && remove.mutate(l.id)}
                className="text-[10px] tracking-luxe text-muted-foreground hover:text-destructive"
              >
                REMOVER
              </button>
            </div>
          </div>
        ))}
        {!isLoading && !logos?.length && (
          <p className="col-span-full text-center text-sm text-muted-foreground">
            Nenhuma logo cadastrada. Faça upload acima.
          </p>
        )}
      </div>
    </div>
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
