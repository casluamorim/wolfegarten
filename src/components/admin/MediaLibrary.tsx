import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useMediaLibrary, type MediaKind, type MediaItemWithUrl } from "@/hooks/use-media-library";
import { toWebpIfRaster, MAX_IMAGE_BYTES, MAX_VIDEO_BYTES, humanBytes } from "@/lib/img-to-webp";
import { probeVideo } from "@/lib/video-poster";

const KINDS: { id: MediaKind | "all"; label: string }[] = [
  { id: "all", label: "TUDO" },
  { id: "image", label: "IMAGENS" },
  { id: "video", label: "VÍDEOS" },
  { id: "logo", label: "LOGOS" },
  { id: "render", label: "RENDERS" },
];

export function MediaLibrary({
  pickerMode = false,
  filterKinds,
  onPick,
}: {
  pickerMode?: boolean;
  filterKinds?: MediaKind[];
  onPick?: (item: MediaItemWithUrl) => void;
}) {
  const [kind, setKind] = useState<MediaKind | "all">(filterKinds?.[0] ?? "all");
  const [search, setSearch] = useState("");
  const { data, isLoading } = useMediaLibrary({ kind, search });
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(0);
  const [errs, setErrs] = useState<string[]>([]);
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleKinds = filterKinds ? KINDS.filter((k) => k.id === "all" || filterKinds.includes(k.id as MediaKind)) : KINDS;
  const items = (data ?? []).filter((it) => !filterKinds || filterKinds.includes(it.kind));

  const upload = async (file: File) => {
    setBusy((b) => b + 1);
    try {
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (file.size > limit) {
        setErrs((e) => [...e, `${file.name}: muito grande (${humanBytes(file.size)})`]);
        return;
      }

      let kindGuess: MediaKind = isVideo ? "video" : "image";
      // pequenos heurísticos para nomeação
      const lower = file.name.toLowerCase();
      if (!isVideo && (lower.includes("logo"))) kindGuess = "logo";
      if (!isVideo && (lower.includes("render"))) kindGuess = "render";

      const optimized = isVideo ? file : await toWebpIfRaster(file, 0.9, 3200);
      const ext = optimized.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "webp");
      const base = `${kindGuess}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const path = `${kindGuess}s/${base}.${ext}`;
      const up = await supabase.storage.from("site-assets").upload(path, optimized, {
        cacheControl: "31536000",
        upsert: false,
        contentType: optimized.type || file.type || undefined,
      });
      if (up.error) throw up.error;

      let posterPath: string | null = null;
      let width = 0;
      let height = 0;
      let duration = 0;

      if (isVideo) {
        const probe = await probeVideo(file);
        width = probe.width;
        height = probe.height;
        duration = probe.duration;
        if (probe.posterBlob) {
          const pPath = `posters/${base}.jpg`;
          const pUp = await supabase.storage.from("site-assets").upload(pPath, probe.posterBlob, {
            cacheControl: "31536000",
            contentType: "image/jpeg",
          });
          if (!pUp.error) posterPath = pPath;
        }
      } else {
        const bmp = await createImageBitmap(optimized).catch(() => null);
        if (bmp) {
          width = bmp.width;
          height = bmp.height;
        }
      }

      const client = supabase as unknown as {
        from: (t: string) => { insert: (p: Record<string, unknown>) => Promise<{ error: unknown }> };
      };
      const { error } = await client.from("media_library").insert({
        kind: kindGuess,
        storage_path: path,
        mime: optimized.type || file.type || null,
        bytes: optimized.size,
        width: width || null,
        height: height || null,
        duration: duration || null,
        poster_path: posterPath,
        alt: file.name.replace(/\.[^.]+$/, ""),
      });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["media-library"] });
    } catch (e) {
      setErrs((arr) => [...arr, `${file.name}: ${e instanceof Error ? e.message : "erro"}`]);
    } finally {
      setBusy((b) => Math.max(0, b - 1));
    }
  };

  const onFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    Array.from(files).forEach(upload);
  };

  const removeItem = async (it: MediaItemWithUrl) => {
    if (!confirm("Remover este arquivo da biblioteca?")) return;
    const client = supabase as unknown as {
      from: (t: string) => { delete: () => { eq: (c: string, v: string) => Promise<{ error: unknown }> } };
    };
    await client.from("media_library").delete().eq("id", it.id);
    await supabase.storage.from("site-assets").remove([it.storage_path, ...(it.poster_path ? [it.poster_path] : [])]);
    await qc.invalidateQueries({ queryKey: ["media-library"] });
  };

  return (
    <div>
      {!pickerMode && (
        <div className="mb-6">
          <h2 className="font-serif text-3xl text-offwhite">Biblioteca de Mídia</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload único para imagens, vídeos, logos e renders. Selecione onde usar nas seções do site.
          </p>
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          onFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded border-2 border-dashed p-6 text-center transition-colors ${
          drag ? "border-gold bg-gold/5" : "border-border hover:border-gold/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className="text-[10px] tracking-luxe text-gold hover:underline"
        >
          {busy ? `ENVIANDO ${busy} ARQUIVO(S)...` : "ARRASTE OU CLIQUE PARA ENVIAR"}
        </button>
        <p className="text-[10px] text-muted-foreground">
          Imagens (até 50MB) • Vídeos (até 2GB) • MP4, WebM, MOV
        </p>
      </div>

      {errs.length > 0 && (
        <div className="mt-3 space-y-1">
          {errs.map((e, i) => (
            <p key={i} className="text-xs text-destructive">{e}</p>
          ))}
          <button onClick={() => setErrs([])} className="text-[10px] text-muted-foreground hover:text-gold">limpar</button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {visibleKinds.map((k) => (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              className={`rounded-full border px-3 py-1 text-[10px] tracking-luxe transition-colors ${
                kind === k.id
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-border text-muted-foreground hover:border-gold/40"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou tag..."
          className="ml-auto w-full max-w-xs rounded border border-border bg-background px-3 py-1.5 text-xs text-offwhite outline-none focus:border-gold"
        />
      </div>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>}

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((it) => (
          <MediaCard
            key={it.id}
            item={it}
            pickerMode={pickerMode}
            onPick={onPick}
            onRemove={removeItem}
          />
        ))}
        {!isLoading && items.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
            Nenhuma mídia ainda. Arraste arquivos acima.
          </p>
        )}
      </div>
    </div>
  );
}

function MediaCard({
  item,
  pickerMode,
  onPick,
  onRemove,
}: {
  item: MediaItemWithUrl;
  pickerMode: boolean;
  onPick?: (it: MediaItemWithUrl) => void;
  onRemove: (it: MediaItemWithUrl) => void;
}) {
  const isVideo = item.kind === "video";
  return (
    <div className="group relative overflow-hidden rounded border border-border bg-card">
      <div
        className="relative aspect-square cursor-pointer bg-background"
        onClick={() => pickerMode && onPick?.(item)}
      >
        {isVideo ? (
          item.posterUrl ? (
            <img src={item.posterUrl} alt={item.alt ?? ""} className="h-full w-full object-cover" />
          ) : (
            <video src={item.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
          )
        ) : (
          <img src={item.url} alt={item.alt ?? ""} className="h-full w-full object-contain" loading="lazy" />
        )}
        <span className="absolute left-2 top-2 rounded bg-background/70 px-2 py-0.5 text-[9px] tracking-luxe text-gold backdrop-blur">
          {item.kind.toUpperCase()}
        </span>
        {pickerMode && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full border border-gold px-4 py-1 text-[10px] tracking-luxe text-gold">SELECIONAR</span>
          </div>
        )}
      </div>
      <div className="px-2 py-1.5">
        <div className="truncate text-[10px] text-offwhite/80">{item.alt ?? "(sem nome)"}</div>
        {!pickerMode && (
          <button
            onClick={() => onRemove(item)}
            className="mt-1 text-[9px] tracking-luxe text-muted-foreground hover:text-destructive"
          >
            REMOVER
          </button>
        )}
      </div>
    </div>
  );
}
