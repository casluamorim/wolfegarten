import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";

const TARGET = new Date("2026-05-16T10:00:00-03:00").getTime();

function diff() {
  const d = TARGET - Date.now();
  if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(d / 86400000),
    h: Math.floor((d / 3600000) % 24),
    m: Math.floor((d / 60000) % 60),
    s: Math.floor((d / 1000) % 60),
  };
}

export function Countdown() {
  const [t, setT] = useState(diff());
  useEffect(() => {
    const i = setInterval(() => setT(diff()), 1000);
    return () => clearInterval(i);
  }, []);

  const items = [
    { v: t.d, l: "DIAS" },
    { v: t.h, l: "HORAS" },
    { v: t.m, l: "MINUTOS" },
    { v: t.s, l: "SEGUNDOS" },
  ];

  return (
    <section className="relative bg-forest-deep py-28 md:py-40">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <div className="text-[10px] tracking-luxe text-gold">CONTAGEM REGRESSIVA</div>
          <div className="mx-auto my-6 gold-divider" />
          <h2 className="font-serif text-3xl font-light text-offwhite md:text-5xl">
            Para o lançamento oficial
          </h2>
        </Reveal>

        <Reveal delay={300}>
          <div className="mt-16 grid grid-cols-4 gap-4 md:gap-12">
            {items.map((it) => (
              <div key={it.l} className="flex flex-col items-center">
                <div className="font-serif text-4xl font-light text-gold tabular-nums md:text-7xl">
                  {String(it.v).padStart(2, "0")}
                </div>
                <div className="mt-3 text-[9px] tracking-luxe text-muted-foreground md:text-[10px]">
                  {it.l}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
