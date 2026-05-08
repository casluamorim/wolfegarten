import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGallery, type GalleryImage } from "@/hooks/use-launch";
import { Check, Trash2, Star } from "lucide-react";

const GALLERY_KEYS: { key: string; label: string }[] = [
  { key: "hero", label: "Galeria do Hero (topo)" },
  { key: "info", label: "Galeria da seção Info (final)" },
];

export function GalleriesPanel() {
  return (
    <div>
      <h2 className="font-serif text-3xl text-offwhite">Galerias</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Envie várias imagens e marque a estrela para escolher qual fica ativa no site.
      </p>
      <div className="mt-8 space-y-10">
        {GALLERY_KEYS.map((g) => (
          <GallerySection key={g.key} assetKey={g.key} label={g.label} />
        ))}
      </div>
    </div>
  );
}

function GallerySection({ assetKey, label }: { assetKey: string; label: string }) {
  const qc = useQueryClient();
  const { data, isLoading } = useGallery(assetKey);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["gallery", assetKey] });

  const uploadMany = async (files: FileList | File[]) => {
    setBusy(true);
    setErr(null);
    try {
      const list = Array.from(files);
      for (const file of list) {
        if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name}: máx 8MB`);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `gallery/${assetKey}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const up = await supabase.storage.from("site-assets").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (up.error) throw up.error;
        const { error } = await supabase.from("site_galleries").insert({
          asset_key: assetKey,
          storage_path: path,
          sort_order: Date.now(),
          active: false,
        });
        if (error) throw error;
      }
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  };

  const setActive = async (img: GalleryImage) => {
    // Desativa todas as outras desta chave e ativa a selecionada
    await supabase
      .from("site_galleries")
      .update({ active: false })
      .eq("asset_key", assetKey);
    await supabase.from("site_galleries").update({ active: true }).eq("id", img.id);
    refresh();
  };

  const remove = async (img: GalleryImage) => {
    if (!confirm("Remover esta imagem?")) return;
    await supabase.storage.from("site-assets").remove([img.storage_path]);
    await supabase.from("site_galleries").delete().eq("id", img.id);
    refresh();
  };

  return (
    <div className="rounded border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-offwhite">{label}</h3>
        <span className="text-[10px] tracking-luxe text-muted-foreground">
          {data?.length ?? 0} IMAGEM(NS)
        </span>
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
          if (e.dataTransfer.files?.length) uploadMany(e.dataTransfer.files);
        }}
        className={`mt-4 flex cursor-pointer items-center justify-center rounded border-2 border-dashed py-8 text-[10px] tracking-luxe transition-colors ${
          drag ? "border-gold bg-gold/5 text-gold" : "border-border text-muted-foreground hover:border-gold/50"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => e.target.files?.length && uploadMany(e.target.files)}
        />
        {busy ? "ENVIANDO..." : "ARRASTE VÁRIAS IMAGENS OU CLIQUE"}
      </label>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

      {isLoading && <p className="mt-4 text-xs text-muted-foreground">Carregando...</p>}

      {data && data.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {data.map((img) => (
            <div
              key={img.id}
              className={`group relative overflow-hidden rounded border ${
                img.active ? "border-gold ring-1 ring-gold" : "border-border"
              }`}
            >
              <img src={img.url} alt="" className="h-32 w-full object-cover" />
              {img.active && (
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-gold/90 px-2 py-0.5 text-[9px] font-medium tracking-luxe text-background">
                  <Check className="h-3 w-3" /> ATIVA
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/80 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => setActive(img)}
                  disabled={img.active}
                  className="flex items-center gap-1 text-[10px] tracking-luxe text-gold hover:text-offwhite disabled:opacity-40"
                >
                  <Star className="h-3 w-3" /> ATIVAR
                </button>
                <button
                  onClick={() => remove(img)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
