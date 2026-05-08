import { Reveal } from "./Reveal";

export function Vagas() {
  return (
    <section className="bg-background py-28 md:py-40">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <Reveal>
          <div className="inline-block border border-gold/40 px-8 py-3 text-[10px] tracking-luxe text-gold">
            VAGAS LIMITADAS
          </div>
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-12 font-serif text-2xl font-light italic leading-relaxed text-offwhite md:text-3xl">
            Evento exclusivo para<br />convidados selecionados.
          </p>
          <p className="mt-6 text-sm font-light text-muted-foreground">
            Sua presença é um privilégio.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
