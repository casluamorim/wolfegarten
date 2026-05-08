import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useGallery, type GalleryImage } from "@/hooks/use-launch";
import { Trash2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";

export function PartnersPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useGallery("partners");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const refresh = () => qc.invalidateQueries({ queryKey: ["gallery", "partners"] });

  const uploadMany = async (files: FileList | File[]) => {
    setBusy(true);
    setErr(null);
    try {
      const list = Array.from(files);
      const baseOrder = (data?.length ?? 0) * 10;
      let i = 0;
      for (const file of list) {
        if (file.size > 4 * 1024 * 1024) throw new Error(`${file.name}: máx 4MB`);
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
        const path = `partners/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
        const up = await supabase.storage.from("site-assets").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (up.error) throw up.error;
        const { error } = await supabase.from("site_galleries").insert({
          asset_key: "partners",
          storage_path: path,
          sort_order: baseOrder + i * 10,
          active: true,
        });
        if (error) throw error;
        i++;
      }
      refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (img: GalleryImage) => {
    await supabase.from("site_galleries").update({ active: !img.active }).eq("id", img.id);
    refresh();
  };
  const remove = async (img: GalleryImage) => {
    if (!confirm("Remover este parceiro?")) return;
    await supabase.storage.from("site-assets").remove([img.storage_path]);
    await supabase.from("site_galleries").delete().eq("id", img.id);
    refresh();
  };
  const move = async (img: GalleryImage, dir: -1 | 1) => {
    if (!data) return;
    const idx = data.findIndex((i) => i.id === img.id);
    const swap = data[idx + dir];
    if (!swap) return;
    await Promise.all([
      supabase.from("site_galleries").update({ sort_order: swap.sort_order }).eq("id", img.id),
      supabase.from("site_galleries").update({ sort_order: img.sort_order }).eq("id", swap.id),
    ]);
    refresh();
  };

  return (
    <div className="rounded border border-border bg-card/40 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-offwhite">Parceiros / Logos do rodapé</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Envie PNGs com fundo transparente. Reordene e ative/desative — atualiza no site em tempo real.
          </p>
        </div>
        <span className="text-[10px] tracking-luxe text-muted-foreground">
          {data?.length ?? 0} LOGO(S)
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
        className={`mt-4 flex cursor-pointer items-center justify-center rounded border-2 border-dashed py-6 text-[10px] tracking-luxe transition-colors ${
          drag ? "border-gold bg-gold/5 text-gold" : "border-border text-muted-foreground hover:border-gold/50"
        }`}
      >
        <input
          type="file"
          accept="image/png,image/svg+xml,image/webp"
          multiple
          className="hidden"
          disabled={busy}
          onChange={(e) => e.target.files?.length && uploadMany(e.target.files)}
        />
        {busy ? "ENVIANDO..." : "ARRASTE OS PNGS DOS PARCEIROS OU CLIQUE"}
      </label>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}

      {isLoading && <p className="mt-4 text-xs text-muted-foreground">Carregando...</p>}

      {data && data.length > 0 && (
        <div className="mt-5 space-y-2">
          {data.map((img, idx) => (
            <div
              key={img.id}
              className={`flex items-center gap-3 rounded border bg-background/40 p-2 ${
                img.active ? "border-border" : "border-border opacity-50"
              }`}
            >
              <div className="flex h-12 w-24 items-center justify-center rounded bg-card">
                <img src={img.url} alt="" className="max-h-10 max-w-[88px] object-contain" />
              </div>
              <div className="flex-1 text-[10px] tracking-luxe text-muted-foreground">
                ORDEM {idx + 1}
              </div>
              <button
                onClick={() => move(img, -1)}
                disabled={idx === 0}
                className="rounded p-1 text-muted-foreground hover:text-gold disabled:opacity-30"
                title="Subir"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => move(img, 1)}
                disabled={idx === data.length - 1}
                className="rounded p-1 text-muted-foreground hover:text-gold disabled:opacity-30"
                title="Descer"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggle(img)}
                className="rounded p-1 text-muted-foreground hover:text-gold"
                title={img.active ? "Ocultar" : "Mostrar"}
              >
                {img.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button
                onClick={() => remove(img)}
                className="rounded p-1 text-muted-foreground hover:text-destructive"
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
