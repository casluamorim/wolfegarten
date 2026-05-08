import { useEffect, useState } from "react";
import { getSimulatedDate, setSimulatedDate, onSimChange } from "@/lib/simulation";
import { useLaunchPhase } from "@/hooks/use-launch";

function toLocal(d: Date) {
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export function SimulationPanel() {
  const [active, setActive] = useState<boolean>(!!getSimulatedDate());
  const [val, setVal] = useState<string>(() => {
    const d = getSimulatedDate() ?? new Date();
    return toLocal(d);
  });
  const phase = useLaunchPhase();

  useEffect(() => onSimChange(() => setActive(!!getSimulatedDate())), []);

  const enable = () => {
    setActive(true);
    setSimulatedDate(new Date(val).toISOString());
  };
  const disable = () => {
    setActive(false);
    setSimulatedDate(null);
  };
  const apply = (next: string) => {
    setVal(next);
    if (active && next) setSimulatedDate(new Date(next).toISOString());
  };

  return (
    <div className="rounded border border-gold/30 bg-gold/5 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm text-offwhite">Simulador de data e horário</h3>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Modo apenas de pré-visualização. Não altera a data oficial nem afeta o site público.
          </p>
        </div>
        <span
          className={`rounded px-3 py-1 text-[10px] tracking-luxe ${
            active ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"
          }`}
        >
          {active ? "SIMULAÇÃO ATIVA" : "DESATIVADO"}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_auto]">
        <div>
          <label className="text-[10px] tracking-luxe text-muted-foreground">
            Simular data e horário
          </label>
          <input
            type="datetime-local"
            value={val}
            onChange={(e) => apply(e.target.value)}
            className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
          />
        </div>
        <div className="flex items-end">
          {active ? (
            <button onClick={disable} className="btn-ghost-luxe whitespace-nowrap">
              Desativar simulação
            </button>
          ) : (
            <button onClick={enable} className="btn-ghost-luxe whitespace-nowrap">
              Ativar modo simulação
            </button>
          )}
        </div>
        <div className="flex items-end">
          <div className="text-[10px] tracking-luxe text-muted-foreground">
            FASE SIMULADA:{" "}
            <span className={phase === "post" ? "text-gold" : "text-offwhite"}>
              {phase === "post" ? "FASE 2" : "FASE 1"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
