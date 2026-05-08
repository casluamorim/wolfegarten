import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-wolfegarten.jpg";

export function Hero() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Parallax image */}
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

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,oklch(0.18_0.025_155/0.2),oklch(0.1_0.02_155/0.95))]" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <div
          className="text-[10px] tracking-luxe text-gold opacity-0 animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          CONVITE EXCLUSIVO
        </div>
        <div className="my-6 h-px w-12 bg-gold/60 opacity-0 animate-fade-up" style={{ animationDelay: "0.8s" }} />
        <div
          className="mb-8 text-[11px] tracking-wide-luxe text-offwhite opacity-0 animate-fade-up"
          style={{ animationDelay: "1.1s" }}
        >
          O ALTO PADRÃO CHEGOU A INDAIAL
        </div>

        <h1
          className="font-serif text-5xl font-light text-offwhite text-balance opacity-0 animate-fade-up md:text-7xl lg:text-8xl"
          style={{ animationDelay: "1.4s" }}
        >
          Experiência
          <br />
          <span className="text-gold tracking-wider" style={{ letterSpacing: "0.06em" }}>
            WÖLFEGARTEN
          </span>
        </h1>

        <div className="my-10 h-1.5 w-1.5 rounded-full bg-gold opacity-0 animate-fade-up" style={{ animationDelay: "1.7s" }} />

        <p
          className="max-w-md text-sm font-light leading-relaxed text-offwhite/80 text-balance opacity-0 animate-fade-up md:text-base"
          style={{ animationDelay: "2s" }}
        >
          Um encontro para quem está pronto<br />
          para viver e investir em um novo padrão.
        </p>

        <a
          href="#confirmar"
          className="btn-luxe mt-12 opacity-0 animate-fade-up"
          style={{ animationDelay: "2.3s" }}
        >
          Confirmar Presença
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-gold/40 pt-2">
          <div className="h-2 w-px bg-gold animate-scroll-hint" />
        </div>
      </div>
    </section>
  );
}
