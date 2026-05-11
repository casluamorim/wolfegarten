import { Link } from "@tanstack/react-router";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";
import { usePartnerLogos, type PartnerLogoWithUrl, type LogoCategory } from "@/hooks/use-partner-logos";
import { SocialIcons } from "@/components/SocialIcons";

interface CatLayout {
  colsD: number;
  colsM: number;
  height: number;
  gap: number;
}

function num(v: string | undefined, fb: number) {
  const n = parseInt(v ?? "");
  return Number.isFinite(n) && n > 0 ? n : fb;
}

export function Footer() {
  const realizacaoLabel = useText("logos.realizacao_label", useText("footer.realizacao_label", "REALIZAÇÃO"));
  const apoioLabel = useText("logos.apoio_label", "APOIO");
  const city = useText("contact.address", useText("footer.city", "INDAIAL — SANTA CATARINA"));
  const phone = useText("contact.phone", useText("footer.phone", "(47) 98817-8508"));

  const realLayout: CatLayout = {
    colsD: num(useText("logos.realizacao.cols_desktop", "3"), 3),
    colsM: num(useText("logos.realizacao.cols_mobile", "2"), 2),
    height: num(useText("logos.realizacao.height", "48"), 48),
    gap: num(useText("logos.realizacao.gap", "48"), 48),
  };
  const apoioLayout: CatLayout = {
    colsD: num(useText("logos.apoio.cols_desktop", "4"), 4),
    colsM: num(useText("logos.apoio.cols_mobile", "2"), 2),
    height: num(useText("logos.apoio.height", "36"), 36),
    gap: num(useText("logos.apoio.gap", "40"), 40),
  };

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
      category: "realizacao" as LogoCategory,
      sort_order: i,
      active: true,
      created_at: "",
    }));

  const realizacaoFinal = realizacao.length ? realizacao : legacy;

  return (
    <footer className="border-t border-border bg-background py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-7 text-center md:gap-9">
          <div className="text-[11px] tracking-luxe text-offwhite">WÖLFEGARTEN</div>
          <div className="gold-divider" />

          {realizacaoFinal.length > 0 && (
            <LogoBlock label={realizacaoLabel} items={realizacaoFinal} layout={realLayout} slug="realizacao" />
          )}

          {apoio.length > 0 && (
            <LogoBlock label={apoioLabel} items={apoio} layout={apoioLayout} slug="apoio" />
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

function LogoBlock({
  label,
  items,
  layout,
  slug,
}: {
  label: string;
  items: PartnerLogoWithUrl[];
  layout: CatLayout;
  slug: string;
}) {
  // Centralização: cols efetivas = min(itens, cols configurado)
  const colsD = Math.min(items.length, layout.colsD);
  const colsM = Math.min(items.length, layout.colsM);
  const cls = `wg-logos-${slug}`;
  return (
    <div className="flex w-full flex-col items-center gap-4 pt-2">
      <div className="text-[9px] tracking-luxe text-muted-foreground">{label}</div>
      <style>{`
        .${cls} {
          display: grid;
          grid-template-columns: repeat(${colsM}, minmax(0,1fr));
          gap: ${Math.min(layout.gap, 80)}px;
          place-items: center;
          justify-content: center;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .${cls} { grid-template-columns: repeat(${colsD}, minmax(0,1fr)); }
        }
      `}</style>
      <div className={`${cls} max-w-3xl`}>
        {items.map((l) => {
          const img = (
            <img
              src={l.url}
              alt={l.alt ?? ""}
              loading="lazy"
              decoding="async"
              style={{ height: `${layout.height}px` }}
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
    </div>
  );
}
