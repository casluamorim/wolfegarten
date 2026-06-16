import { useState } from "react";
import { useMediaLibrary, type MediaItemWithUrl } from "@/hooks/use-media-library";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { optimizeImageUrl, srcSet, fallbackToOriginal } from "@/lib/img-url";

interface Props {
  tag?: string;
}

export function GalleryGrid({ tag = "galeria" }: Props) {
  const { data, isLoading } = useMediaLibrary({ kind: "image" });
  const [open, setOpen] = useState<MediaItemWithUrl | null>(null);

  const items = (data ?? []).filter((m) => !tag || m.tags.includes(tag));

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded bg-card" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Nenhuma imagem na galeria. Adicione mídia com a tag <code>{tag}</code> no painel.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => setOpen(m)}
            className="group relative aspect-square overflow-hidden rounded bg-card"
          >
            <img
              src={optimizeImageUrl(m.url, { width: 600, quality: 72 })}
              srcSet={srcSet(m.url, [320, 480, 640, 800], 72)}
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={fallbackToOriginal(m.url)}
              alt={m.alt ?? ""}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-5xl bg-background p-0">
          {open && (
            <img
              src={optimizeImageUrl(open.url, { width: 1920, quality: 82 })}
              srcSet={srcSet(open.url, [1024, 1600, 1920], 82)}
              sizes="100vw"
              onError={fallbackToOriginal(open.url)}
              alt={open.alt ?? ""}
              decoding="async"
              className="h-auto w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
