import { Link } from "@tanstack/react-router";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";
import { usePartnerLogos } from "@/hooks/use-partner-logos";

export function Footer() {
  const realizacaoLabel = useText("footer.realizacao_label", "REALIZAÇÃO");
  const city = useText("contact.address", useText("footer.city", "INDAIAL — SANTA CATARINA"));
  const phone = useText("contact.phone", useText("footer.phone", "(47) 98817-8508"));
  const ig = useText("social.instagram", "");
  const fb = useText("social.facebook", "");
  const yt = useText("social.youtube", "");
  const li = useText("social.linkedin", "");
  const colsD = useText("logos.cols_desktop", "3");
  const colsM = useText("logos.cols_mobile", "2");
  const heightPx = useText("logos.height", "40");
  const gapPx = useText("logos.gap", "48");

  const { data: logos } = usePartnerLogos({ onlyActive: true });
  // fallback para logos antigas via site_assets enquanto não houver partner_logos
  const legacyZah = useSiteAsset("logo-zah");
  const legacyStilo = useSiteAsset("logo-stilo");
  const legacyPrisma = useSiteAsset("logo-prisma");
  const fallback = [legacyZah, legacyStilo, legacyPrisma].filter(Boolean) as string[];
  const showLogos = logos?.length ? logos : fallback.map((url, i) => ({ id: String(i), url, link: null, alt: "" }));

  const socials: { href: string; label: string }[] = [];
  if (ig) socials.push({ href: ig, label: "Instagram" });
  if (fb) socials.push({ href: fb, label: "Facebook" });
  if (yt) socials.push({ href: yt, label: "YouTube" });
  if (li) socials.push({ href: li, label: "LinkedIn" });

  return (
    <footer className="border-t border-border bg-background py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center gap-8 text-center md:gap-10">
          <div className="text-[11px] tracking-luxe text-offwhite">WÖLFEGARTEN</div>
          <div className="gold-divider" />
          {showLogos.length > 0 && (
            <>
              <div className="text-[9px] tracking-luxe text-muted-foreground">{realizacaoLabel}</div>
              <div
                className="grid w-full max-w-3xl items-center justify-items-center wg-logos-grid"
                style={{
                  gap: `${Math.min(parseInt(gapPx) || 32, 64)}px`,
                }}
              >
                <style>{`
                  .wg-logos-grid { grid-template-columns: repeat(${Math.max(1, parseInt(colsM) || 2)}, minmax(0,1fr)); }
                  @media (min-width: 768px) {
                    .wg-logos-grid { grid-template-columns: repeat(${Math.max(1, parseInt(colsD) || 3)}, minmax(0,1fr)); }
                  }
                `}</style>
                {showLogos.map((l) => {
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
                    <a key={l.id} href={l.link} target="_blank" rel="noreferrer">
                      {img}
                    </a>
                  ) : (
                    <div key={l.id}>{img}</div>
                  );
                })}
              </div>
            </>
          )}
          {socials.length > 0 && (
            <div className="flex gap-6 text-[10px] tracking-luxe text-muted-foreground">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="hover:text-gold">
                  {s.label.toUpperCase()}
                </a>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-col items-center gap-1.5 text-[10px] tracking-wide-luxe text-muted-foreground">
            <div>{city}</div>
            <div>{phone}</div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3 text-[9px] tracking-wide-luxe text-muted-foreground/60 md:flex-row md:gap-6">
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
