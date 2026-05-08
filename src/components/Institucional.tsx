import { Reveal } from "./Reveal";
import { useText } from "@/hooks/use-site-content";

export function Institucional() {
  const eyebrow = useText("institucional.eyebrow", "O EMPREENDIMENTO");
  const title = useText("institucional.title", "Wölfegarten");
  const text = useText("institucional.text", "");
  return (
    <section className="bg-background py-20 md:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
          <div className="mx-auto my-6 gold-divider" />
          <h2 className="font-serif text-3xl font-light text-offwhite md:text-5xl whitespace-pre-line">
            {title}
          </h2>
          <p className="mt-8 text-base font-light leading-relaxed text-offwhite/70 whitespace-pre-line md:text-lg">
            {text}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
