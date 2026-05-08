import { Link } from "@tanstack/react-router";
import { useSiteAssets, ASSET_LABELS, type AssetKey } from "@/hooks/use-site-asset";

const LOGOS: { key: AssetKey; fallback: string }[] = [
  { key: "logo-zah", fallback: "ZAH" },
  { key: "logo-stilo", fallback: "STILO LEGACY" },
  { key: "logo-prisma", fallback: "PRISMA CONSTRUTORA" },
];

export function Footer() {
  const { data: assets } = useSiteAssets();
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-10 text-center">
          <div className="text-[11px] tracking-luxe text-offwhite">WÖLFEGARTEN</div>
          <div className="gold-divider" />
          <div className="text-[9px] tracking-luxe text-muted-foreground">REALIZAÇÃO</div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {LOGOS.map(({ key, fallback }) => {
              const url = assets?.[key];
              return url ? (
                <img
                  key={key}
                  src={url}
                  alt={ASSET_LABELS[key]}
                  className="h-10 w-auto opacity-80 transition-opacity hover:opacity-100"
                />
              ) : (
                <div
                  key={key}
                  className="text-xs tracking-wide-luxe text-offwhite/70 transition-colors hover:text-gold"
                >
                  {fallback}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 text-[10px] tracking-wide-luxe text-muted-foreground">
            <div>INDAIAL — SANTA CATARINA</div>
            <div>(47) 98817-8508</div>
          </div>
          <div className="mt-6 flex items-center gap-6 text-[9px] tracking-wide-luxe text-muted-foreground/60">
            <span>© {new Date().getFullYear()} WÖLFEGARTEN — TODOS OS DIREITOS RESERVADOS</span>
            <Link to="/admin/login" className="hover:text-gold">
              ADMIN
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
