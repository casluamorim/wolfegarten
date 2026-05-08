import { Reveal } from "./Reveal";
import { useText } from "@/hooks/use-site-content";

export function Vagas() {
  const badge = useText("vagas.badge", "VAGAS LIMITADAS");
  const title = useText("vagas.title", "Evento exclusivo para\nconvidados selecionados.");
  const sub = useText("vagas.sub", "Sua presença é um privilégio.");
  return (
    <section className="bg-background py-16 md:py-28">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <Reveal>
          <div className="inline-block border border-gold/40 px-8 py-3 text-[10px] tracking-luxe text-gold">
            {badge}
          </div>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-12 font-serif text-2xl font-light italic leading-relaxed text-offwhite md:text-3xl whitespace-pre-line">
            {title}
          </p>
          <p className="mt-6 text-sm font-light text-muted-foreground">{sub}</p>
        </Reveal>
      </div>
    </section>
  );
}
