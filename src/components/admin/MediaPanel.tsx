import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ALL_ASSET_KEYS, ASSET_LABELS, type AssetKey } from "@/hooks/use-site-asset";
import { GalleriesPanel } from "./GalleriesPanel";

const IMAGE_KEYS: AssetKey[] = ALL_ASSET_KEYS.filter((k) => !k.startsWith("logo-"));
const LOGO_KEYS: AssetKey[] = ALL_ASSET_KEYS.filter((k) => k.startsWith("logo-"));

type SubTab = "imagens" | "galerias" | "logos";

const SUBS: { id: SubTab; label: string }[] = [
  { id: "imagens", label: "IMAGENS PRINCIPAIS" },
  { id: "galerias", label: "GALERIAS (LOTE)" },
  { id: "logos", label: "LOGOS" },
];

export function MediaPanel() {
  const [tab, setTab] = useState<SubTab>("imagens");

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-3xl text-offwhite">Mídia</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Biblioteca completa: imagens principais, galerias em lote e logos. Atualização em tempo real.
        </p>
      </div>

      <div className="mb-6 flex gap-6 border-b border-border">
        {SUBS.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`pb-3 text-[10px] tracking-luxe transition-colors ${
              tab === s.id ? "border-b border-gold text-gold" : "text-muted-foreground"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {tab === "imagens" && <Assets keys={IMAGE_KEYS} />}
      {tab === "galerias" && <GalleriesPanel />}
      {tab === "logos" && <Assets keys={LOGO_KEYS} />}
    </div>
  );
}

function Assets({ keys }: { keys: AssetKey[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {keys.map((k) => (
        <AssetCard key={k} assetKey={k} />
      ))}
    </div>
  );
}

function AssetCard({ assetKey }: { assetKey: AssetKey }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const current = useQuery({
    queryKey: ["asset", assetKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_assets")
        .select("storage_path")
        .eq("asset_key", assetKey)
        .maybeSingle();
      if (!data) return null;
      return supabase.storage.from("site-assets").getPublicUrl(data.storage_path).data.publicUrl;
    },
  });

  const onUpload = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error("Máx 8MB");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${assetKey}-${Date.now()}.${ext}`;
      const up = await supabase.storage
        .from("site-assets")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (up.error) throw up.error;
      const { error } = await supabase
        .from("site_assets")
        .upsert({ asset_key: assetKey, storage_path: path }, { onConflict: "asset_key" });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["asset", assetKey] });
      await qc.invalidateQueries({ queryKey: ["site-assets"] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  };

  const isLogo = assetKey.startsWith("logo-");

  return (
    <div className="glass-card p-5">
      <div className="text-[10px] tracking-luxe text-gold">{ASSET_LABELS[assetKey]}</div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(f);
        }}
        className={`mt-4 flex cursor-pointer items-center justify-center overflow-hidden rounded border-2 border-dashed bg-background transition-colors ${
          drag ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
        } ${isLogo ? "h-28" : "h-40"}`}
      >
        <input
          type="file"
          accept={isLogo ? "image/png,image/svg+xml,image/webp" : "image/jpeg,image/png,image/webp"}
          className="hidden"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        {current.data ? (
          <img
            src={current.data}
            alt={ASSET_LABELS[assetKey]}
            loading="lazy"
            className={isLogo ? "max-h-20 object-contain" : "h-full w-full object-cover"}
          />
        ) : (
          <span className="text-[10px] tracking-luxe text-muted-foreground">
            {busy ? "ENVIANDO..." : "ARRASTE OU CLIQUE"}
          </span>
        )}
      </label>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
