import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";

interface NetworkInformation {
  effectiveType?: string;
  saveData?: boolean;
}

function getConnection(): NetworkInformation | null {
  if (typeof navigator === "undefined") return null;
  const nav = navigator as Navigator & { connection?: NetworkInformation };
  return nav.connection ?? null;
}

function isSlowConnection(): boolean {
  const c = getConnection();
  if (!c) return false;
  if (c.saveData) return true;
  if (c.effectiveType && /^(slow-2g|2g|3g)$/.test(c.effectiveType)) return true;
  return false;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export interface SmartVideoSource {
  src: string;
  type?: string;
}

export interface SmartVideoProps {
  sources?: SmartVideoSource[];
  src?: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muteToggle?: boolean;
  /** click-to-play: vídeo só carrega ao clicar no poster */
  clickToPlay?: boolean;
  ariaLabel?: string;
  onPlayingChange?: (playing: boolean) => void;
  /** força não carregar em conexões lentas, mostrando botão manual */
  respectSlowConnection?: boolean;
}

export function SmartVideo({
  sources,
  src,
  poster,
  className = "",
  autoPlay = true,
  loop = true,
  muteToggle = false,
  clickToPlay = false,
  ariaLabel,
  onPlayingChange,
  respectSlowConnection = true,
}: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [errored, setErrored] = useState(false);
  const [muted, setMuted] = useState(true);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [userTriggered, setUserTriggered] = useState(false);

  const reduce = prefersReducedMotion();
  const slow = respectSlowConnection && isSlowConnection();
  const effectiveAutoPlay = autoPlay && !reduce && !clickToPlay;

  // Lazy decision: carregar src apenas quando visível, conexão boa, e não click-to-play
  useEffect(() => {
    if (clickToPlay) return; // só carrega após clique
    if (slow) return;
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShouldLoad(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [clickToPlay, slow]);

  useEffect(() => {
    onPlayingChange?.(ready);
  }, [ready, onPlayingChange]);

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => undefined);
  };

  const startManually = () => {
    setUserTriggered(true);
    setShouldLoad(true);
    requestAnimationFrame(() => {
      const v = ref.current;
      if (v) {
        v.muted = clickToPlay ? false : true;
        setMuted(v.muted);
        v.play().catch(() => undefined);
      }
    });
  };

  const allSources: SmartVideoSource[] = sources && sources.length > 0
    ? sources
    : src
    ? [{ src }]
    : [];

  const showManualButton = (slow || clickToPlay || reduce) && !userTriggered && !ready;

  return (
    <div ref={containerRef} className={`relative h-full w-full overflow-hidden ${className}`}>
      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready && !errored ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {shouldLoad && allSources.length > 0 && !errored && (
        <video
          ref={ref}
          poster={poster}
          autoPlay={effectiveAutoPlay || userTriggered}
          loop={loop}
          muted={muted}
          playsInline
          preload={effectiveAutoPlay || userTriggered ? "auto" : "metadata"}
          aria-label={ariaLabel}
          onCanPlay={() => requestAnimationFrame(() => setReady(true))}
          onError={() => {
            setErrored(true);
            setReady(false);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        >
          {allSources.map((s, i) => (
            <source key={i} src={s.src} type={s.type} />
          ))}
        </video>
      )}

      {showManualButton && allSources.length > 0 && (
        <button
          onClick={startManually}
          aria-label="Reproduzir vídeo"
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/30 transition-colors hover:bg-background/40"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-background/40 backdrop-blur-md transition-all hover:border-gold hover:bg-background/60">
            <Play className="h-6 w-6 text-gold" fill="currentColor" />
          </span>
        </button>
      )}

      {muteToggle && ready && !errored && (
        <button
          onClick={toggleMute}
          aria-label={muted ? "Ativar som" : "Desativar som"}
          className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-background/30 px-3 py-1.5 text-[10px] tracking-luxe text-offwhite backdrop-blur-md transition-all hover:border-gold hover:text-gold"
        >
          {muted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
          {muted ? "ATIVAR SOM" : "SILENCIAR"}
        </button>
      )}
    </div>
  );
}
