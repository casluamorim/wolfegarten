import { Link } from "@tanstack/react-router";
import { useSiteAssets, ASSET_LABELS, type AssetKey } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";
import { useGallery } from "@/hooks/use-launch";

const FALLBACK_LOGOS: { key: AssetKey; fallback: string }[] = [
  { key: "logo-zah", fallback: "ZAH" },
  { key: "logo-stilo", fallback: "STILO LEGACY" },
  { key: "logo-prisma", fallback: "PRISMA CONSTRUTORA" },
];

export function Footer() {
  const { data: assets } = useSiteAssets();
  const { data: partners } = useGallery("partners");
  const realizacaoLabel = useText("footer.realizacao_label", "REALIZAÇÃO");
  const city = useText("footer.city", "INDAIAL — SANTA CATARINA");
  const phone = useText("footer.phone", "(47) 98817-8508");

  const activePartners = partners?.filter((p) => p.active) ?? [];

  return (
    <footer className="border-t border-border bg-background py-10 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-7 text-center md:gap-10">
          <div className="text-[11px] tracking-luxe text-offwhite">WÖLFEGARTEN</div>
          <div className="gold-divider" />
          <div className="text-[9px] tracking-luxe text-muted-foreground">{realizacaoLabel}</div>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5 md:gap-x-12 md:gap-y-6">
            {activePartners.length > 0
              ? activePartners.map((p) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt="Parceiro"
                    loading="lazy"
                    className="h-8 w-auto opacity-80 transition-opacity hover:opacity-100 md:h-10"
                  />
                ))
              : FALLBACK_LOGOS.map(({ key, fallback }) => {
                  const url = assets?.[key];
                  return url ? (
                    <img
                      key={key}
                      src={url}
                      alt={ASSET_LABELS[key]}
                      loading="lazy"
                      className="h-8 w-auto opacity-80 transition-opacity hover:opacity-100 md:h-10"
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
          <div className="mt-4 flex flex-col items-center gap-2 text-[10px] tracking-wide-luxe text-muted-foreground md:mt-6">
            <div>{city}</div>
            <div>{phone}</div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 text-[9px] tracking-wide-luxe text-muted-foreground/60 md:mt-6 md:flex-row md:gap-6">
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
