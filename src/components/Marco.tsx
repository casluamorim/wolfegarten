import { Reveal } from "./Reveal";
import { useText } from "@/hooks/use-site-content";

export function Marco() {
  const eyebrow = useText("marco.eyebrow", "UM NOVO MARCO");
  const title = useText("marco.title", "Um novo marco\nem Indaial");
  const p1 = useText("marco.p1", "");
  const p2 = useText("marco.p2", "");
  const quote = useText("marco.quote", "");

  return (
    <section className="relative bg-background py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
          <div className="mx-auto my-8 gold-divider" />
        </Reveal>

        <Reveal delay={200}>
          <h2 className="font-serif text-3xl font-light leading-tight text-offwhite text-balance md:text-5xl whitespace-pre-line">
            {title}
          </h2>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-8 md:mt-12 space-y-6 text-base font-light leading-relaxed text-offwhite/70 md:text-lg">
            <p>{p1}</p>
            <p>{p2}</p>
            <p className="font-serif text-xl italic text-gold/90 md:text-2xl whitespace-pre-line">
              {quote}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
