import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";
import { useLaunchPhase } from "@/hooks/use-launch-phase";

export function Navbar() {
  const logo = useSiteAsset("logo-main");
  const phase = useLaunchPhase();
  const cta = useText(
    phase === "live" ? "navbar.cta_live" : "navbar.cta",
    phase === "live" ? "AGENDAR VISITA" : "CONFIRMAR PRESENÇA",
  );
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
      style={{
        backgroundColor: scrolled ? "oklch(0.14 0.02 155 / 0.7)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid oklch(1 0 0 / 0.06)" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-12 md:py-6">
        {logo ? (
          <img src={logo} alt="Wölfegarten" className="h-8 w-auto md:h-10" />
        ) : (
          <div className="text-[11px] tracking-luxe text-offwhite">WOLFEGARTEN</div>
        )}
        {phase === "live" ? (
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/empreendimento" className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold">EMPREENDIMENTO</Link>
            <Link to="/galeria" className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold">GALERIA</Link>
            <Link to="/videos" className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold">VÍDEOS</Link>
            <Link to="/contato" className="text-[10px] tracking-wide-luxe text-gold hover:text-offwhite">{cta}</Link>
          </div>
        ) : (
          <a
            href="#confirmar"
            className="hidden text-[10px] tracking-wide-luxe text-muted-foreground transition-colors hover:text-gold md:block"
          >
            {cta}
          </a>
        )}
      </div>
    </nav>
  );
}
