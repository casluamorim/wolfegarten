import { useEffect, useRef, useState } from "react";
import { useMediaLibrary } from "@/hooks/use-media-library";
import { SmartVideo } from "@/components/SmartVideo";
import { useVideoPlayback } from "./VideoPlaybackContext";

interface Props {
  tag?: string;
}

function VideoCard({
  id,
  url,
  poster,
  alt,
}: {
  id: string;
  url: string;
  poster: string | null;
  alt: string;
}) {
  const ctx = useVideoPlayback();
  const ref = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!ctx) return;
    ctx.register(id, () => {
      setActive(false);
      videoRef.current?.pause();
    });
    return () => ctx.unregister(id);
  }, [ctx, id]);

  // pausa ao sair do viewport
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting && active) {
            setActive(false);
            videoRef.current?.pause();
          }
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  const handleClick = () => {
    setActive(true);
    ctx?.setCurrent(id);
  };

  return (
    <div ref={ref} className="group relative aspect-video overflow-hidden rounded bg-card">
      {active ? (
        <video
          ref={videoRef}
          src={url}
          poster={poster ?? undefined}
          autoPlay
          controls
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          aria-label={alt}
        />
      ) : (
        <button onClick={handleClick} className="absolute inset-0 h-full w-full" aria-label={`Reproduzir ${alt}`}>
          {poster ? (
            <img
              src={poster}
              alt={alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-card" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-background/30 transition-colors group-hover:bg-background/50">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-background/40 backdrop-blur-md">
              <svg viewBox="0 0 24 24" className="ml-1 h-5 w-5 fill-gold">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export function VideoGallery({ tag = "videos" }: Props) {
  const { data, isLoading } = useMediaLibrary({ kind: "video" });
  const items = (data ?? []).filter((m) => !tag || m.tags.includes(tag));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="aspect-video animate-pulse rounded bg-card" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground">
        Nenhum vídeo. Faça upload na biblioteca de mídia e marque com a tag <code>{tag}</code>.
      </p>
    );
  }

  // SmartVideo unused fallback import ensures bundle inclusion if needed later
  void SmartVideo;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {items.map((m) => (
        <VideoCard key={m.id} id={m.id} url={m.url} poster={m.posterUrl} alt={m.alt ?? "Vídeo"} />
      ))}
    </div>
  );
}
