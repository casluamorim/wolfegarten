import { useText } from "@/hooks/use-site-content";

/**
 * Mapa da Central de Vendas.
 * Lê do site_content:
 *  - sales.address (endereço completo)
 *  - sales.map_embed (URL completa de embed do Google Maps, opcional)
 * Se não houver embed, monta uma busca pelo endereço.
 */
export function SalesMap({ compact = false }: { compact?: boolean }) {
  const address = useText("sales.address", "");
  const embed = useText("sales.map_embed", "");
  const label = useText("sales.label", "Central de Vendas");

  if (!address && !embed) return null;

  const src =
    embed ||
    `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const directions = address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
    : null;

  return (
    <section className="bg-card/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 text-center">
          <div className="text-[10px] tracking-luxe text-gold">VISITE A CENTRAL DE VENDAS</div>
          <h2 className="mt-4 font-serif text-3xl font-light text-offwhite md:text-4xl">{label}</h2>
          {address && (
            <p className="mx-auto mt-3 max-w-xl whitespace-pre-line text-sm text-offwhite/70">
              {address}
            </p>
          )}
          {directions && (
            <a
              href={directions}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-[10px] tracking-luxe text-gold hover:underline"
            >
              COMO CHEGAR →
            </a>
          )}
        </div>
        <div
          className={`overflow-hidden rounded border border-border ${compact ? "aspect-[16/9]" : "aspect-[16/9] md:aspect-[21/9]"}`}
        >
          <iframe
            title={label}
            src={src}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}
