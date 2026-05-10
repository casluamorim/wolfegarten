import { Link } from "@tanstack/react-router";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";
import { usePartnerLogos, type PartnerLogoWithUrl } from "@/hooks/use-partner-logos";
import { SocialIcons } from "@/components/SocialIcons";

export function Footer() {
  const realizacaoLabel = useText("logos.realizacao_label", useText("footer.realizacao_label", "REALIZAÇÃO"));
  const apoioLabel = useText("logos.apoio_label", "APOIO");
  const city = useText("contact.address", useText("footer.city", "INDAIAL — SANTA CATARINA"));
  const phone = useText("contact.phone", useText("footer.phone", "(47) 98817-8508"));
  const colsD = useText("logos.cols_desktop", "3");
  const colsM = useText("logos.cols_mobile", "2");
  const heightPx = useText("logos.height", "40");
  const gapPx = useText("logos.gap", "48");

  const { data: logos } = usePartnerLogos({ onlyActive: true });
  const realizacao = (logos ?? []).filter((l) => l.category === "realizacao");
  const apoio = (logos ?? []).filter((l) => l.category === "apoio");

  // Fallback antigo (apenas se NÃO houver logos cadastradas)
  const legacyZah = useSiteAsset("logo-zah");
  const legacyStilo = useSiteAsset("logo-stilo");
  const legacyPrisma = useSiteAsset("logo-prisma");
  const legacy: PartnerLogoWithUrl[] = (logos?.length ?? 0) > 0 ? [] :
    [legacyZah, legacyStilo, legacyPrisma].filter(Boolean).map((url, i) => ({
      id: `legacy-${i}`,
      url: url as string,
      link: null,
      alt: "",
      storage_path: "",
      placement: "footer",
      category: "realizacao" as const,
      sort_order: i,
      active: true,
      created_at: "",
    }));

  const realizacaoFinal = realizacao.length ? realizacao : legacy;

  const renderGrid = (items: PartnerLogoWithUrl[]) => (
    <div
      className="grid w-full max-w-3xl items-center justify-items-center wg-logos-grid"
      style={{ gap: `${Math.min(parseInt(gapPx) || 32, 64)}px` }}
    >
      {items.map((l) => {
        const img = (
          <img
            src={l.url}
            alt={l.alt ?? ""}
            loading="lazy"
            decoding="async"
            style={{ height: `${parseInt(heightPx) || 40}px` }}
            className="w-auto opacity-80 transition-opacity hover:opacity-100"
          />
        );
        return l.link ? (
          <a key={l.id} href={l.link} target="_blank" rel="noreferrer">{img}</a>
        ) : (
          <div key={l.id}>{img}</div>
        );
      })}
    </div>
  );

  return (
    <footer className="border-t border-border bg-background py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-7 text-center md:gap-9">
          <div className="text-[11px] tracking-luxe text-offwhite">WÖLFEGARTEN</div>
          <div className="gold-divider" />

          <style>{`
            .wg-logos-grid { grid-template-columns: repeat(${Math.max(1, parseInt(colsM) || 2)}, minmax(0,1fr)); }
            @media (min-width: 768px) {
              .wg-logos-grid { grid-template-columns: repeat(${Math.max(1, parseInt(colsD) || 3)}, minmax(0,1fr)); }
            }
          `}</style>

          {realizacaoFinal.length > 0 && (
            <div className="flex w-full flex-col items-center gap-4">
              <div className="text-[9px] tracking-luxe text-muted-foreground">{realizacaoLabel}</div>
              {renderGrid(realizacaoFinal)}
            </div>
          )}

          {apoio.length > 0 && (
            <div className="flex w-full flex-col items-center gap-4 pt-2">
              <div className="text-[9px] tracking-luxe text-muted-foreground">{apoioLabel}</div>
              {renderGrid(apoio)}
            </div>
          )}

          <SocialIcons className="mt-2" />

          <div className="mt-1 flex flex-col items-center gap-1.5 text-[10px] tracking-wide-luxe text-muted-foreground">
            <div>{city}</div>
            <div>{phone}</div>
          </div>
          <div className="mt-3 flex flex-col items-center gap-3 text-[9px] tracking-wide-luxe text-muted-foreground/60 md:flex-row md:gap-6">
            <span>© {new Date().getFullYear()} WÖLFEGARTEN — TODOS OS DIREITOS RESERVADOS</span>
            <Link to="/admin/login" className="hover:text-gold">ADMIN</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
