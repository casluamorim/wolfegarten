import { useState } from "react";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { type MediaKind, type MediaItemWithUrl } from "@/hooks/use-media-library";

interface Props {
  value: string;
  onChange: (url: string) => void;
  kinds?: MediaKind[];
  label?: string;
}

export function MediaPicker({ value, onChange, kinds = ["image", "video"], label = "Selecionar mídia" }: Props) {
  const [open, setOpen] = useState(false);
  const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(value);

  return (
    <>
      <div className="flex items-stretch gap-3 rounded border border-border bg-background p-2">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded bg-card">
          {value ? (
            isVideo ? (
              <video src={value} className="h-full w-full object-cover" muted playsInline preload="metadata" />
            ) : (
              <img src={value} alt="" className="h-full w-full object-cover" />
            )
          ) : (
            <span className="text-[9px] tracking-luxe text-muted-foreground">VAZIO</span>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-1.5">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da mídia"
            className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-offwhite outline-none focus:border-gold"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setOpen(true)}
              className="rounded border border-gold/40 px-3 py-1 text-[10px] tracking-luxe text-gold hover:bg-gold/10"
            >
              {label}
            </button>
            {value && (
              <button
                onClick={() => onChange("")}
                className="text-[10px] tracking-luxe text-muted-foreground hover:text-destructive"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur" onClick={() => setOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded border border-border bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-offwhite">Selecionar mídia</h3>
              <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-gold">FECHAR ✕</button>
            </div>
            <MediaLibrary
              pickerMode
              filterKinds={kinds}
              onPick={(it: MediaItemWithUrl) => {
                onChange(it.url);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
