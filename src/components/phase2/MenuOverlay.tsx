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
  { label: "Contato", to: "/contato" },
];

const FALLBACK_SECONDARY: MenuItem[] = [
  { label: "Áreas de Lazer", to: "/lazer" },
  { label: "Masterplan", to: "/masterplan" },
  { label: "Galeria", to: "/galeria" },
  { label: "Vídeos", to: "/videos" },
  { label: "Localização", to: "/localizacao" },
];

function parseMenu(value: unknown, fallback: MenuItem[]): MenuItem[] {
  if (Array.isArray(value)) {
    return value.filter(
      (i): i is MenuItem =>
        !!i && typeof i === "object" && typeof (i as MenuItem).label === "string" && typeof (i as MenuItem).to === "string",
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

export function MenuOverlay({ open, onClose, cta }: Props) {
  const { data } = useSiteContent();
  const primary = parseMenu(data?.["phase2.menu.primary"], FALLBACK_PRIMARY);
  const secondary = parseMenu(data?.["phase2.menu.secondary"], FALLBACK_SECONDARY);

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

  return (
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-500 ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
      role="dialog"
      aria-label="Menu principal"
    >
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-2xl"
        onClick={onClose}
      />

      <div className="relative flex h-full w-full flex-col">
        <div className="flex items-center justify-between px-6 py-5 md:px-12 md:py-6">
          <span className="text-[10px] tracking-luxe text-gold">MENU</span>
          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="rounded-full border border-gold/40 p-2 text-gold transition-colors hover:bg-gold/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-12 overflow-y-auto px-6 py-10">
          <ul className="space-y-4 text-center">
            {primary.map((it) => (
              <li key={it.to}>
                <Link
                  to={it.to}
                  onClick={onClose}
                  className="font-serif text-4xl font-light text-offwhite transition-colors hover:text-gold md:text-6xl"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="h-px w-12 bg-gold/40" />

          <ul className="grid grid-cols-1 gap-3 text-center sm:grid-cols-2">
            {secondary.map((it) => (
              <li key={it.to}>
                <Link
                  to={it.to}
                  onClick={onClose}
                  className="text-[11px] tracking-luxe text-muted-foreground transition-colors hover:text-gold"
                >
                  {it.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>

          {cta && (
            <Link to="/contato" onClick={onClose} className="btn-luxe mt-4">
              {cta}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
