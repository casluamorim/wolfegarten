import { Reveal } from "./Reveal";
import { ChefHat, Wine, Car, Gem } from "lucide-react";
import expFallback from "@/assets/experience.jpg";
import { useSiteAsset } from "@/hooks/use-site-asset";
import { useText } from "@/hooks/use-site-content";

export function Experience() {
  const expImg = useSiteAsset("experience", expFallback);
  const eyebrow = useText("experience.eyebrow", "A EXPERIÊNCIA");
  const title = useText("experience.title", "Detalhes pensados\npara os sentidos");

  const items = [
    { Icon: ChefHat, title: useText("experience.item1_title", "Gastronomia"), text: useText("experience.item1_text", "") },
    { Icon: Wine, title: useText("experience.item2_title", "Espumante & Chopp"), text: useText("experience.item2_text", "") },
    { Icon: Car, title: useText("experience.item3_title", "Test Drive"), text: useText("experience.item3_text", "") },
    { Icon: Gem, title: useText("experience.item4_title", "Condições Exclusivas"), text: useText("experience.item4_text", "") },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${expImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(2px)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center">
          <Reveal>
            <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
            <div className="mx-auto my-6 gold-divider" />
            <h2 className="font-serif text-3xl font-light text-offwhite md:text-5xl whitespace-pre-line">
              {title}
            </h2>
          </Reveal>
        </div>

        <div className="mt-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="glass-card group h-full p-8 text-center">
                <it.Icon
                  className="mx-auto mb-6 h-7 w-7 text-gold transition-transform duration-700 group-hover:scale-110"
                  strokeWidth={1}
                />
                <h3 className="font-serif text-xl font-light text-offwhite">{it.title}</h3>
                <div className="mx-auto my-4 h-px w-8 bg-gold/40" />
                <p className="text-xs font-light leading-relaxed text-muted-foreground">{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
