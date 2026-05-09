import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { useText } from "@/hooks/use-site-content";
import { useSimulation } from "@/hooks/use-simulation";

function diff(target: number) {
  const d = target - Date.now();
  if (d <= 0) return { d: 0, h: 0, m: 0, s: 0 };
  return {
    d: Math.floor(d / 86400000),
    h: Math.floor((d / 3600000) % 24),
    m: Math.floor((d / 60000) % 60),
    s: Math.floor((d / 1000) % 60),
  };
}

export function Countdown() {
  const eyebrow = useText("countdown.eyebrow", "CONTAGEM REGRESSIVA");
  const title = useText("countdown.title", "Para o lançamento oficial");
  const targetStr = useText("countdown.target_date", "2026-05-16T10:00:00-03:00");
  const target = new Date(targetStr).getTime();
  const sim = useSimulation();

  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const compute = () => {
      const now = sim.enabled && sim.iso ? new Date(sim.iso).getTime() : Date.now();
      setT(diff(target - (now - Date.now())));
    };
    compute();
    const i = setInterval(compute, 1000);
    return () => clearInterval(i);
  }, [target, sim.enabled, sim.iso]);

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
          <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
          <div className="mx-auto my-6 gold-divider" />
          <h2 className="font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
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
