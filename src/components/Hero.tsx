import { useEffect, useState } from "react";
import heroFallback from "@/assets/hero-wolfegarten.jpg";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";

export function Hero() {
  const heroImg = useSiteAsset("hero", heroFallback);
  const eyebrow = useText("hero.eyebrow", "CONVITE EXCLUSIVO");
  const kicker = useText("hero.kicker", "O ALTO PADRÃO CHEGOU A INDAIAL");
  const t1 = useText("hero.title_line1", "Experiência");
  const t2 = useText("hero.title_line2", "WÖLFEGARTEN");
  const subtitle = useText(
    "hero.subtitle",
    "Um encontro para quem está pronto\npara viver e investir em um novo padrão.",
  );
  const cta = useText("hero.cta", "Confirmar Presença");

  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${y * 0.4}px, 0)` }}
      >
        <img
          src={heroImg}
          alt="Wolfegarten — empreendimento de alto padrão em Indaial"
          className="h-full w-full object-cover animate-kenburns"
          width={1920}
          height={1080}
        />
      </div>

      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.18_0.025_155/0.2),oklch(0.1_0.02_155/0.95))]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className="text-[10px] tracking-luxe text-gold opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          {eyebrow}
        </div>
        <div
          className="my-6 h-px w-12 bg-gold/60 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.8s" }}
        />
        <div
          className="mb-8 text-[11px] tracking-wide-luxe text-offwhite opacity-0 animate-fade-up"
          style={{ animationDelay: "1.1s" }}
        >
          {kicker}
        </div>

        <h1
          className="font-serif text-5xl font-light text-offwhite text-balance opacity-0 animate-fade-up md:text-7xl lg:text-8xl"
          style={{ animationDelay: "1.4s" }}
        >
          {t1}
          <br />
          <span className="text-gold tracking-wider" style={{ letterSpacing: "0.06em" }}>
            {t2}
          </span>
        </h1>

        <div
          className="my-10 h-1.5 w-1.5 rounded-full bg-gold opacity-0 animate-fade-up"
          style={{ animationDelay: "1.7s" }}
        />

        <p
          className="max-w-md text-sm font-light leading-relaxed text-offwhite/80 text-balance opacity-0 animate-fade-up md:text-base whitespace-pre-line"
          style={{ animationDelay: "2s" }}
        >
          {subtitle}
        </p>

        <a
          href="#confirmar"
          className="btn-luxe mt-12 opacity-0 animate-fade-up"
          style={{ animationDelay: "2.3s" }}
        >
          {cta}
        </a>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-gold/40 pt-2">
          <div className="h-2 w-px bg-gold animate-scroll-hint" />
        </div>
      </div>
    </section>
  );
}
