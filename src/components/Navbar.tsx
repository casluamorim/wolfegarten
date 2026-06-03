import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";
import { MenuOverlay } from "@/components/phase2/MenuOverlay";

export function Navbar() {
  const logo = useSiteAsset("logo-main");
  const cta = useText("navbar.cta", "AGENDAR VISITA");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-700"
        style={{
          backgroundColor: scrolled ? "oklch(0.14 0.02 155 / 0.7)" : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottom: scrolled ? "1px solid oklch(1 0 0 / 0.06)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5 md:px-12 md:py-6">
          <Link to="/" className="shrink-0">
            {logo ? (
              <img src={logo} alt="Wölfegarten" className="h-8 w-auto md:h-10" />
            ) : (
              <span className="text-[11px] tracking-luxe text-offwhite">WOLFEGARTEN</span>
            )}
          </Link>

          <div className="flex items-center gap-3 md:gap-8">
            <Link
              to="/"
              className="hidden text-[10px] tracking-luxe text-muted-foreground hover:text-gold md:inline"
            >
              HOME
            </Link>
            <Link
              to="/empreendimento"
              className="hidden text-[10px] tracking-luxe text-muted-foreground hover:text-gold md:inline"
            >
              EMPREENDIMENTO
            </Link>
            <Link
              to="/infraestrutura"
              className="hidden text-[10px] tracking-luxe text-muted-foreground hover:text-gold md:inline"
            >
              INFRAESTRUTURA
            </Link>
            <Link
              to="/contato"
              className="hidden text-[10px] tracking-luxe text-muted-foreground hover:text-gold md:inline"
            >
              CONTATO
            </Link>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menu"
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-3 py-1.5 text-[10px] tracking-luxe text-gold transition-all hover:bg-gold/10"
            >
              <Menu className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">MENU</span>
            </button>
          </div>
        </div>
      </nav>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} cta={cta} />
    </>
  );
}
