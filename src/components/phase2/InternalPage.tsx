import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useText } from "@/hooks/use-site-content";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GalleryGrid } from "@/components/phase2/GalleryGrid";
import { VideoGallery } from "@/components/phase2/VideoGallery";
import { VideoPlaybackProvider } from "@/components/phase2/VideoPlaybackContext";
import { VisitForm } from "@/components/phase2/VisitForm";
import { SalesMap } from "@/components/phase2/SalesMap";
import { WhatsAppFAB } from "@/components/phase2/WhatsAppFAB";
import { optimizeImageUrl, srcSet, fallbackToOriginal } from "@/lib/img-url";

interface Props {
  /** slug curto da página — usado nas chaves do CMS e tags da galeria por padrão. */
  slug: string;
  /** Título exibido por padrão (override pelo CMS em `page.{slug}.title`). */
  defaultTitle: string;
  defaultEyebrow?: string;
  defaultSubtitle?: string;
  /** Quando true, exibe Galeria em destaque (na ordem normal). */
  showGallery?: boolean;
  /** Quando true, exibe Vídeos. */
  showVideos?: boolean;
  /** Se a página é a "galeria" principal, força grid grande. */
  fullGallery?: boolean;
  /** Se a página é a "videos" principal, força grid de vídeos grande. */
  fullVideos?: boolean;
}

export function InternalPage({
  slug,
  defaultTitle,
  defaultEyebrow,
  defaultSubtitle,
  showGallery = true,
  showVideos = true,
  fullGallery = false,
  fullVideos = false,
}: Props) {
  const eyebrow = useText(`page.${slug}.eyebrow`, defaultEyebrow ?? "WÖLFEGARTEN");
  const title = useText(`page.${slug}.title`, defaultTitle);
  const subtitle = useText(`page.${slug}.subtitle`, defaultSubtitle ?? "");
  const heroImg = useText(`page.${slug}.hero_image`, "");
  const intro = useText(`page.${slug}.intro`, "");
  const content = useText(`page.${slug}.content`, "");
  const galleryTag = useText(`page.${slug}.gallery_tag`, slug);
  const videosTag = useText(`page.${slug}.videos_tag`, slug);
  const ctaTitle = useText(`page.${slug}.cta_title`, "Quer conhecer pessoalmente?");
  const ctaSubtitle = useText(
    `page.${slug}.cta_subtitle`,
    "Agende uma visita guiada à Central de Vendas.",
  );
  const ctaLabel = useText(`page.${slug}.cta_label`, "Agendar Visita");

  // Preload LCP image
  useEffect(() => {
    if (!heroImg) return;
    const href = optimizeImageUrl(heroImg, { width: 1920, quality: 75 });
    const l = document.createElement("link");
    l.rel = "preload";
    l.as = "image";
    l.href = href;
    l.setAttribute("fetchpriority", "high");
    document.head.appendChild(l);
    return () => {
      l.remove();
    };
  }, [heroImg]);

  return (
    <VideoPlaybackProvider>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[68svh] min-h-[420px] md:min-h-[520px] w-full overflow-hidden">
          {heroImg ? (
            <img
              src={optimizeImageUrl(heroImg, { width: 1920, quality: 75 })}
              srcSet={srcSet(heroImg, [768, 1280, 1920], 75)}
              sizes="100vw"
              onError={fallbackToOriginal(heroImg)}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-card to-background" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,oklch(0.14_0.02_155/0.55),oklch(0.1_0.02_155/0.92))]" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 pt-20 text-center">
            <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
            <div className="my-4 h-px w-10 bg-gold/60 md:my-6 md:w-12" />
            <h1 className="font-serif text-3xl font-light leading-[1.08] text-offwhite md:text-6xl">{title}</h1>
            {subtitle && (
              <p className="mt-4 max-w-xl text-[13px] font-light text-offwhite/80 md:mt-6 md:text-base">
                {subtitle}
              </p>
            )}
          </div>
        </section>

        {/* Intro + conteúdo */}
        {(intro || content) && (
          <section className="bg-background py-10 md:py-20">
            <div className="mx-auto max-w-3xl px-5 md:px-6">
              {intro && (
                <p className="text-center font-serif text-xl font-light leading-relaxed text-offwhite/90 md:text-2xl">
                  {intro}
                </p>
              )}
              {intro && content && <div className="mx-auto my-10 h-px w-12 bg-gold/60" />}
              {content && (
                <div className="whitespace-pre-line text-base leading-relaxed text-offwhite/80">
                  {content}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Galeria */}
        {showGallery && (
          <section className="bg-card/40 py-10 md:py-20">
            <div className={`mx-auto px-6 ${fullGallery ? "max-w-7xl" : "max-w-6xl"}`}>
              {!fullGallery && (
                <div className="mb-10 text-center">
                  <div className="text-[10px] tracking-luxe text-gold">GALERIA</div>
                  <h2 className="mt-2 font-serif text-xl font-light text-offwhite md:text-3xl">
                    Imagens
                  </h2>
                </div>
              )}
              <GalleryGrid tag={galleryTag} />
            </div>
          </section>
        )}

        {/* Vídeos */}
        {showVideos && (
          <section className="bg-background py-10 md:py-20">
            <div className={`mx-auto px-6 ${fullVideos ? "max-w-7xl" : "max-w-6xl"}`}>
              {!fullVideos && (
                <div className="mb-10 text-center">
                  <div className="text-[10px] tracking-luxe text-gold">VÍDEOS</div>
                  <h2 className="mt-2 font-serif text-xl font-light text-offwhite md:text-3xl">
                    Conheça em movimento
                  </h2>
                </div>
              )}
              <VideoGallery tag={videosTag} />
            </div>
          </section>
        )}

        {/* CTA Visita */}
        <section className="bg-card/40 py-10 md:py-16">
          <div className="mx-auto max-w-3xl px-5 text-center md:px-6">
            <h2 className="font-serif text-3xl font-light text-offwhite md:text-4xl">{ctaTitle}</h2>
            <p className="mt-4 text-sm text-offwhite/70 md:text-base">{ctaSubtitle}</p>
            <Link to="/contato" className="btn-luxe mt-6 inline-block md:mt-8">
              {ctaLabel}
            </Link>
          </div>
        </section>

        {/* Mapa Central de Vendas */}
        <SalesMap />

        {/* Formulário de visita */}
        <VisitForm origem={defaultTitle} />
      </main>
      <Footer />
      <WhatsAppFAB
        message={`Olá! Tenho interesse em ${defaultTitle.toLowerCase()} do Wölfegarten e gostaria de mais informações.`}
      />
    </VideoPlaybackProvider>
  );
}
