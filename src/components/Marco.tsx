import { Reveal } from "./Reveal";

export function Marco() {
  return (
    <section className="relative bg-background py-32 md:py-48">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <div className="text-[10px] tracking-luxe text-gold">UM NOVO MARCO</div>
          <div className="mx-auto my-8 gold-divider" />
        </Reveal>

        <Reveal delay={200}>
          <h2 className="font-serif text-3xl font-light leading-tight text-offwhite text-balance md:text-5xl">
            Um novo marco<br />em Indaial
          </h2>
        </Reveal>

        <Reveal delay={400}>
          <div className="mt-12 space-y-6 text-base font-light leading-relaxed text-offwhite/70 md:text-lg">
            <p>
              O <span className="text-gold">WOLFEGARTEN</span> nasce para ser mais do que um condomínio.
              Ele representa uma virada de chave no conceito de viver bem em Indaial.
            </p>
            <p>
              Um projeto pensado para quem valoriza segurança, sofisticação e qualidade de vida,
              onde cada detalhe foi desenhado para elevar o padrão da cidade.
            </p>
            <p className="font-serif text-xl italic text-gold/90 md:text-2xl">
              Aqui, não se trata apenas de morar.<br />Se trata de viver uma nova experiência.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
