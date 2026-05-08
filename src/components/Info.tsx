import { Reveal } from "./Reveal";
import { MapPin, Calendar, Clock } from "lucide-react";
import infoFallback from "@/assets/info-bg.jpg";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";
import { useActiveGalleryImage } from "@/hooks/use-launch";

export function Info() {
  const galleryImg = useActiveGalleryImage("info");
  const fallbackImg = useSiteAsset("info", infoFallback);
  const infoImg = galleryImg ?? fallbackImg;
  const eyebrow = useText("info.eyebrow", "INFORMAÇÕES");

  const blocks = [
    { Icon: MapPin, label: "LOCAL", title: useText("info.local_title", "Indaial"), sub: useText("info.local_sub", "") },
    { Icon: Calendar, label: "DATA", title: useText("info.date_title", "16 de Maio"), sub: useText("info.date_sub", "Sábado") },
    { Icon: Clock, label: "HORÁRIO", title: useText("info.time_title", "10h — 16h"), sub: useText("info.time_sub", "Recepção às 10h") },
  ];

  return (
    <section className="relative overflow-hidden py-32 md:py-44">
      <div
        className="absolute inset-0 scale-110"
        style={{
          backgroundImage: `url(${infoImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(3px)",
        }}
      />
      <div className="absolute inset-0 bg-forest-deep/80" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <Reveal>
            <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
            <div className="mx-auto my-6 gold-divider" />
          </Reveal>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {blocks.map((b, i) => (
            <Reveal key={b.label} delay={i * 200}>
              <div className="text-center">
                <b.Icon className="mx-auto mb-5 h-6 w-6 text-gold" strokeWidth={1} />
                <div className="text-[10px] tracking-luxe text-gold/80">{b.label}</div>
                <div className="mx-auto my-4 h-px w-6 bg-gold/40" />
                <div className="font-serif text-2xl font-light text-offwhite md:text-3xl">
                  {b.title}
                </div>
                <p className="mt-3 whitespace-pre-line text-xs font-light leading-relaxed text-offwhite/60">
                  {b.sub}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
