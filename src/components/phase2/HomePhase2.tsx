import { Link } from "@tanstack/react-router";
import { useText } from "@/hooks/use-site-content";
import { useSiteAsset } from "@/hooks/use-site-asset";
import heroFallback from "@/assets/hero-wolfegarten.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SmartVideo, type SmartVideoSource } from "@/components/SmartVideo";
import { FlexibleMedia } from "@/components/phase2/FlexibleMedia";
import { GalleryGrid } from "@/components/phase2/GalleryGrid";
import { VideoPlaybackProvider } from "@/components/phase2/VideoPlaybackContext";
import { Confirm } from "@/components/Confirm";

function inferType(url: string): string | undefined {
  const u = url.toLowerCase().split("?")[0];
  if (u.endsWith(".webm")) return "video/webm";
  if (u.endsWith(".mp4")) return "video/mp4";
  if (u.endsWith(".mov")) return "video/quicktime";
  return undefined;
}

export function HomePhase2() {
  return (
    <VideoPlaybackProvider>
      <Navbar />
      <main>
        <HeroSection />
        <VideoIntroSection />
        <ConceitoSection />
        <DiferenciaisSection />
        <RendersSection />
        <InfraSection />
        <LazerSection />
        <MasterplanSection />
        <LocalizacaoSection />
        <GaleriaPreviewSection />
        <CTAVisitaSection />
        <Confirm />
      </main>
      <Footer />
    </VideoPlaybackProvider>
  );
}

/* ------------------------- Hero (apenas imagem) ------------------------- */
function HeroSection() {
  const eyebrow = useText("phase2.home.hero.eyebrow", "WÖLFEGARTEN · INDAIAL");
  const t1 = useText("phase2.home.hero.title_line1", "Um novo padrão");
  const t2 = useText("phase2.home.hero.title_line2", "de viver.");
  const sub = useText("phase2.home.hero.subtitle", "");
  const cta = useText("phase2.home.hero.cta", "Agendar uma Visita");
  const customImg = useText("phase2.home.hero.image_url", "");
  const fallback = useSiteAsset("hero", heroFallback);
  const img = customImg || fallback;

  return (
    <section className="relative h-[92svh] min-h-[640px] w-full overflow-hidden">
      <img
        src={img}
        alt="Empreendimento Wölfegarten"
        className="absolute inset-0 h-full w-full object-cover animate-kenburns"
        loading="eager"
        // @ts-expect-error fetchpriority is valid HTML5
        fetchpriority="high"
      />
      <div className="absolute inset-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_30%,oklch(0.18_0.025_155/0.2),oklch(0.1_0.02_155/0.95))]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
        <div className="my-6 h-px w-12 bg-gold/60" />
        <h1 className="font-serif text-5xl font-light text-offwhite md:text-7xl lg:text-8xl">
          {t1}
          <br />
          <span className="text-gold">{t2}</span>
        </h1>
        {sub && (
          <p className="mt-10 max-w-md text-sm font-light leading-relaxed text-offwhite/80 md:text-base">
            {sub}
          </p>
        )}
        <Link to="/contato" className="btn-luxe mt-12">
          {cta}
        </Link>
      </div>
    </section>
  );
}

/* ----------------------- Vídeo institucional ----------------------- */
function VideoIntroSection() {
  const eyebrow = useText("phase2.home.video.eyebrow", "FILME INSTITUCIONAL");
  const title = useText("phase2.home.video.title", "A experiência Wölfegarten");
  const url = useText("phase2.home.video.video_url", "");
  const poster = useText("phase2.home.video.video_poster", "");

  if (!url && !poster) return null;

  const sources: SmartVideoSource[] = url ? [{ src: url, type: inferType(url) }] : [];

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
        <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
        <div className="mx-auto my-8 h-px w-12 bg-gold/60" />
        <div className="relative aspect-video w-full overflow-hidden rounded-sm border border-border bg-card">
          {url ? (
            <SmartVideo
              sources={sources}
              poster={poster}
              autoPlay
              loop
              muteToggle
              ariaLabel={title}
            />
          ) : (
            <img src={poster} alt={title} className="h-full w-full object-cover" />
          )}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Conceito --------------------------- */
function ConceitoSection() {
  const eyebrow = useText("phase2.home.conceito.eyebrow", "CONCEITO");
  const title = useText("phase2.home.conceito.title", "");
  const text = useText("phase2.home.conceito.text", "");

  return (
    <section className="bg-card/40 py-20 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
        <div>
          <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
          <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
          <div className="my-6 h-px w-12 bg-gold/60" />
          <p className="text-base leading-relaxed text-offwhite/80">{text}</p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm">
          <FlexibleMedia baseKey="phase2.home.conceito" alt={title} />
        </div>
      </div>
    </section>
  );
}

/* ------------------------- Diferenciais ------------------------- */
function DiferenciaisSection() {
  const eyebrow = useText("phase2.home.diferenciais.eyebrow", "DIFERENCIAIS");
  const title = useText("phase2.home.diferenciais.title", "");
  const i1t = useText("phase2.home.diferenciais.item1_title", "");
  const i1x = useText("phase2.home.diferenciais.item1_text", "");
  const i2t = useText("phase2.home.diferenciais.item2_title", "");
  const i2x = useText("phase2.home.diferenciais.item2_text", "");
  const i3t = useText("phase2.home.diferenciais.item3_title", "");
  const i3x = useText("phase2.home.diferenciais.item3_text", "");
  const i4t = useText("phase2.home.diferenciais.item4_title", "");
  const i4x = useText("phase2.home.diferenciais.item4_text", "");
  const items = [
    { title: i1t, text: i1x },
    { title: i2t, text: i2x },
    { title: i3t, text: i3x },
    { title: i4t, text: i4x },
  ];

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
        <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
        <div className="mx-auto my-8 h-px w-12 bg-gold/60" />
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <div key={i} className="border-t border-gold/20 pt-6 text-left">
              <div className="text-[10px] tracking-luxe text-gold">0{i + 1}</div>
              <h3 className="mt-3 font-serif text-xl text-offwhite">{it.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-offwhite/70">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------- Renders 3D (galeria) ----------------------- */
function RendersSection() {
  const eyebrow = useText("phase2.home.renders.eyebrow", "RENDERS 3D");
  const title = useText("phase2.home.renders.title", "");
  return (
    <section className="bg-card/40 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
          <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
          <div className="mx-auto my-8 h-px w-12 bg-gold/60" />
        </div>
        <GalleryGrid tag="renders" />
      </div>
    </section>
  );
}

/* --------------------- Infra / Lazer / Masterplan --------------------- */
function MediaTextSection({
  baseKey,
  reverse = false,
  bgClass = "bg-background",
}: {
  baseKey: string;
  reverse?: boolean;
  bgClass?: string;
}) {
  const eyebrow = useText(`${baseKey}.eyebrow`, "");
  const title = useText(`${baseKey}.title`, "");
  const text = useText(`${baseKey}.text`, "");

  return (
    <section className={`${bgClass} py-20 md:py-28`}>
      <div className={`mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2 ${reverse ? "md:[direction:rtl]" : ""}`}>
        <div className="md:[direction:ltr]">
          <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
          <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
          <div className="my-6 h-px w-12 bg-gold/60" />
          <p className="text-base leading-relaxed text-offwhite/80">{text}</p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm md:[direction:ltr]">
          <FlexibleMedia baseKey={baseKey} alt={title} />
        </div>
      </div>
    </section>
  );
}

const InfraSection = () => <MediaTextSection baseKey="phase2.home.infra" />;
const LazerSection = () => <MediaTextSection baseKey="phase2.home.lazer" reverse bgClass="bg-card/40" />;

function MasterplanSection() {
  const eyebrow = useText("phase2.home.masterplan.eyebrow", "MASTERPLAN");
  const title = useText("phase2.home.masterplan.title", "");
  const text = useText("phase2.home.masterplan.text", "");
  const img = useText("phase2.home.masterplan.image_url", "");

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
        <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
        <div className="mx-auto my-8 h-px w-12 bg-gold/60" />
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-offwhite/80">{text}</p>
        {img && (
          <div className="mt-12 overflow-hidden rounded-sm border border-border">
            <img src={img} alt={title} className="h-auto w-full" />
          </div>
        )}
      </div>
    </section>
  );
}

function LocalizacaoSection() {
  const eyebrow = useText("phase2.home.localizacao.eyebrow", "LOCALIZAÇÃO");
  const title = useText("phase2.home.localizacao.title", "");
  const text = useText("phase2.home.localizacao.text", "");
  const address = useText("phase2.home.localizacao.address", "");
  return (
    <section className="bg-card/40 py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
        <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
        <div className="mx-auto my-8 h-px w-12 bg-gold/60" />
        <p className="text-base leading-relaxed text-offwhite/80">{text}</p>
        {address && <p className="mt-6 text-[11px] tracking-luxe text-gold">{address.toUpperCase()}</p>}
      </div>
    </section>
  );
}

function GaleriaPreviewSection() {
  return (
    <section className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <div className="text-[10px] tracking-luxe text-gold">GALERIA</div>
          <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-5xl">
            Imagens do empreendimento
          </h2>
          <div className="mx-auto my-8 h-px w-12 bg-gold/60" />
        </div>
        <GalleryGrid tag="galeria" />
        <div className="mt-10 text-center">
          <Link to="/galeria" className="btn-ghost-luxe">VER GALERIA COMPLETA</Link>
        </div>
      </div>
    </section>
  );
}

function CTAVisitaSection() {
  const eyebrow = useText("phase2.home.cta.eyebrow", "AGENDE SUA VISITA");
  const title = useText("phase2.home.cta.title", "");
  const text = useText("phase2.home.cta.text", "");
  const button = useText("phase2.home.cta.button", "Agendar Visita");

  return (
    <section className="relative isolate overflow-hidden py-28 md:py-36">
      <div className="absolute inset-0 -z-10">
        <FlexibleMedia baseKey="phase2.home.cta" alt={title} />
        <div className="absolute inset-0 bg-background/80" />
      </div>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
        <h2 className="mt-4 font-serif text-4xl font-light text-offwhite md:text-6xl">{title}</h2>
        <div className="mx-auto my-8 h-px w-12 bg-gold/60" />
        <p className="mx-auto max-w-xl text-base leading-relaxed text-offwhite/80">{text}</p>
        <Link to="/contato" className="btn-luxe mt-10 inline-block">
          {button}
        </Link>
      </div>
    </section>
  );
}
