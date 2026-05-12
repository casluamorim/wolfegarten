import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useText } from "@/hooks/use-site-content";
import { useLaunchPhase } from "@/hooks/use-launch-phase";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { GalleryGrid } from "@/components/phase2/GalleryGrid";
import { VideoGallery } from "@/components/phase2/VideoGallery";
import { VideoPlaybackProvider } from "@/components/phase2/VideoPlaybackContext";

interface Props {
  pageKey: string;
  variant?: "simple" | "galeria" | "videos" | "contato";
  guard?: boolean;
}

export function Phase2Page({ pageKey, variant = "simple", guard = true }: Props) {
  const phase = useLaunchPhase();
  const navigate = useNavigate();

  useEffect(() => {
    if (guard && phase !== "live") {
      navigate({ to: "/" });
    }
  }, [guard, phase, navigate]);

  if (guard && phase !== "live") return null;

  return (
    <VideoPlaybackProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24">
          <Phase2Content pageKey={pageKey} variant={variant} />
        </main>
        <Footer />
      </div>
    </VideoPlaybackProvider>
  );
}

function Phase2Content({ pageKey, variant }: { pageKey: string; variant: Props["variant"] }) {
  const title = useText(`phase2.${pageKey}.title`, pageKey);
  const text = useText(`phase2.${pageKey}.text`, "");

  if (variant === "galeria") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-center font-serif text-4xl font-light text-offwhite md:text-5xl">{title}</h1>
        <div className="mx-auto my-8 h-px w-16 bg-gold" />
        <GalleryGrid tag="galeria" />
      </section>
    );
  }

  if (variant === "videos") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <h1 className="text-center font-serif text-4xl font-light text-offwhite md:text-5xl">{title}</h1>
        <div className="mx-auto my-8 h-px w-16 bg-gold" />
        <VideoGallery tag="videos" />
      </section>
    );
  }

  if (variant === "contato") {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24">
        <h1 className="font-serif text-4xl font-light text-offwhite md:text-5xl">{title}</h1>
        <div className="mx-auto my-8 h-px w-16 bg-gold" />
        <p className="text-base text-offwhite/80">{text}</p>
        <a href="#confirmar" className="btn-luxe mt-10 inline-block">Agendar Visita</a>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24">
      <h1 className="font-serif text-4xl font-light text-offwhite md:text-5xl">{title}</h1>
      <div className="mx-auto my-8 h-px w-16 bg-gold" />
      <p className="whitespace-pre-line text-base text-offwhite/80">{text}</p>
    </section>
  );
}

export function phase2Head(pageKey: string, defaults: { title: string; description: string }) {
  // SSR-safe: returns static defaults; client overrides via React effect when needed.
  // TanStack head() is not reactive to React state during SSR, so we keep defaults.
  return () => ({
    meta: [
      { title: `${defaults.title} — WÖLFEGARTEN` },
      { name: "description", content: defaults.description },
      { property: "og:title", content: `${defaults.title} — WÖLFEGARTEN` },
      { property: "og:description", content: defaults.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${defaults.title} — WÖLFEGARTEN` },
      { name: "twitter:description", content: defaults.description },
    ],
  });
}
