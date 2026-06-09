import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useSiteContent } from "@/hooks/use-site-content";

export interface MenuItem {
  label: string;
  to: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  cta?: string;
}

const FALLBACK_PRIMARY: MenuItem[] = [
  { label: "Home", to: "/" },
  { label: "Empreendimento", to: "/empreendimento" },
  { label: "Infraestrutura", to: "/infraestrutura" },
];

const FALLBACK_SECONDARY: MenuItem[] = [
  { label: "Academias", to: "/academias" },
  { label: "Piscina", to: "/piscina" },
  { label: "Áreas de Lazer", to: "/lazer" },
  { label: "Masterplan", to: "/masterplan" },
  { label: "Galeria", to: "/galeria" },
  { label: "Vídeos", to: "/videos" },
  { label: "Localização", to: "/localizacao" },
  { label: "Contato", to: "/contato" },
];

function parseMenu(value: unknown, fallback: MenuItem[]): MenuItem[] {
  if (Array.isArray(value)) {
    return value.filter(
      (i): i is MenuItem =>
        !!i &&
        typeof i === "object" &&
        typeof (i as MenuItem).label === "string" &&
        typeof (i as MenuItem).to === "string",
    );
  }
  if (typeof value === "string" && value.trim().startsWith("[")) {
    try {
      return parseMenu(JSON.parse(value), fallback);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function MenuOverlay({ open, onClose, cta = "AGENDAR VISITA" }: Props) {
  const { data } = useSiteContent();
  const primary = parseMenu(data?.["phase2.menu.primary"], FALLBACK_PRIMARY);
  const secondary = parseMenu(data?.["phase2.menu.secondary"], FALLBACK_SECONDARY);
  const quote =
    (typeof data?.["phase2.menu.quote"] === "string" && (data["phase2.menu.quote"] as string)) ||
    "Um novo paradigma de sofisticação — onde a arquitetura encontra a serenidade.";

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted && !open) return null;

  // split half secondary into two columns
  const half = Math.ceil(secondary.length / 2);
  const colA = secondary.slice(0, half);
  const colB = secondary.slice(half);

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
      role="dialog"
      aria-label="Menu principal"
    >
      {/* base */}
      <div className="absolute inset-0 bg-[#0a0a0a]" onClick={onClose} />

      {/* atmosphere on the right */}
      <div
        className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 bg-cover bg-center opacity-25 md:block"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1600')",
        }}
      />
      <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-1/2 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent md:block" />

      <div className="relative flex h-full w-full flex-col text-offwhite">
        {/* Header */}
        <header className="z-20 flex items-center justify-between px-6 py-6 md:px-16 md:py-10">
          <span className="text-[10px] font-light uppercase tracking-[0.3em] text-gold">MENU</span>
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="group flex cursor-pointer items-center gap-4"
          >
            <span className="text-[10px] uppercase tracking-[0.3em] opacity-50 transition-opacity group-hover:opacity-100">
              Fechar
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-gold">
              <X className="h-3.5 w-3.5" />
            </div>
          </button>
        </header>

        {/* Main split */}
        <main className="z-10 flex flex-1 items-center overflow-y-auto px-6 md:px-16">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 md:grid-cols-2">
            {/* Nav column */}
            <div>
              <nav className="flex flex-col">
                {primary.map((it, idx) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={onClose}
                    className="group flex items-baseline gap-6 py-2"
                  >
                    <span className="text-[10px] font-light text-gold opacity-60">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-4xl font-light italic-none transition-all duration-500 group-hover:translate-x-3 group-hover:italic group-hover:text-gold md:text-5xl lg:text-6xl">
                      {it.label}
                    </span>
                  </Link>
                ))}

                <div className="mt-8 grid grid-cols-2 gap-x-8 border-t border-white/5 pt-8">
                  <div className="flex flex-col space-y-4">
                    {colA.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        onClick={onClose}
                        className="text-[11px] uppercase tracking-luxe text-offwhite/60 transition-all hover:text-gold"
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-4">
                    {colB.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        onClick={onClose}
                        className="text-[11px] uppercase tracking-luxe text-offwhite/60 transition-all hover:text-gold"
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>
            </div>

            {/* CTA / decorative */}
            <div className="hidden flex-col items-end justify-end pb-6 md:flex">
              <div className="mb-12 max-w-xs text-right">
                <p className="font-serif text-xl italic leading-relaxed text-offwhite/40">
                  “{quote}”
                </p>
              </div>
              <Link
                to="/contato"
                onClick={onClose}
                className="group relative inline-flex items-center justify-center overflow-hidden px-10 py-5"
              >
                <span className="absolute inset-0 bg-gold transition-transform duration-500 group-hover:scale-x-105" />
                <span className="relative text-[11px] font-semibold uppercase tracking-[0.4em] text-black">
                  {cta}
                </span>
              </Link>
            </div>
          </div>
        </main>

        {/* Mobile CTA */}
        <div className="z-10 px-6 pb-6 md:hidden">
          <Link
            to="/contato"
            onClick={onClose}
            className="block w-full bg-gold py-5 text-center text-[11px] font-semibold uppercase tracking-[0.4em] text-black"
          >
            {cta}
          </Link>
        </div>

        {/* Footer */}
        <footer className="z-10 flex items-center justify-between border-t border-white/5 px-6 py-5 text-[9px] uppercase tracking-[0.3em] text-offwhite/40 md:px-16">
          <span>Wölfegarten · Empreendimento</span>
          <div className="flex gap-6">
            <a
              href={
                (typeof data?.["contact.instagram"] === "string" &&
                  (data["contact.instagram"] as string)) ||
                "#"
              }
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-gold"
            >
              Instagram
            </a>
            <a
              href={`https://wa.me/${
                (typeof data?.["contact.whatsapp"] === "string" &&
                  (data["contact.whatsapp"] as string).replace(/\D/g, "")) ||
                ""
              }`}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-gold"
            >
              WhatsApp
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
