import { useSimulation, useLaunchPhase } from "@/hooks/use-simulation";

export function SimulationPanel() {
  const { enabled, iso, setEnabled, setIso, clear } = useSimulation();
  const phase = useLaunchPhase();

  const presets: { label: string; value: string | null }[] = [
    { label: "Agora (real)", value: null },
    { label: "1 dia antes do lançamento", value: offsetTarget(-86400000) },
    { label: "5 minutos antes", value: offsetTarget(-5 * 60000) },
    { label: "Exatamente no lançamento", value: offsetTarget(0) },
    { label: "1 hora depois", value: offsetTarget(3600000) },
    { label: "1 semana depois", value: offsetTarget(7 * 86400000) },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Preview & Simulação</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Simule a passagem do tempo para visualizar como o site se comportará na transição entre as fases.
          Esta simulação fica salva apenas no seu navegador e <strong>não afeta o site público</strong>.
        </p>
      </div>

      <div className="rounded border border-border bg-card p-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-offwhite">Ativar modo simulação</span>
        </label>

        <div className="mt-6">
          <label className="text-[10px] tracking-luxe text-muted-foreground">SIMULAR DATA E HORÁRIO</label>
          <input
            type="datetime-local"
            value={iso ? toLocalInput(iso) : ""}
            onChange={(e) => setIso(e.target.value ? new Date(e.target.value).toISOString() : null)}
            disabled={!enabled}
            className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold disabled:opacity-50"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.label}
              disabled={!enabled && p.value !== null}
              onClick={() => {
                if (p.value === null) {
                  clear();
                } else {
                  setEnabled(true);
                  setIso(p.value);
                }
              }}
              className="rounded border border-border px-3 py-1.5 text-[10px] tracking-luxe text-offwhite/80 hover:border-gold hover:text-gold disabled:opacity-30"
            >
              {p.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-3 rounded bg-background/60 p-4 text-xs text-muted-foreground md:grid-cols-3">
          <div>
            <div className="text-[10px] tracking-luxe text-muted-foreground">STATUS</div>
            <div className="mt-1 text-offwhite">{enabled ? "Simulação ativa" : "Tempo real"}</div>
          </div>
          <div>
            <div className="text-[10px] tracking-luxe text-muted-foreground">FASE DETECTADA</div>
            <div className={`mt-1 ${phase === "live" ? "text-gold" : "text-offwhite"}`}>
              {phase === "live" ? "PÓS-LANÇAMENTO" : "PRÉ-LANÇAMENTO"}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-luxe text-muted-foreground">DATA SIMULADA</div>
            <div className="mt-1 text-offwhite">
              {enabled && iso ? new Date(iso).toLocaleString("pt-BR") : "—"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <a
          href="/?preview=1"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost-luxe"
        >
          ABRIR SITE EM NOVA ABA
        </a>
        <button onClick={clear} className="btn-ghost-luxe">DESLIGAR SIMULAÇÃO</button>
      </div>
    </div>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function offsetTarget(deltaMs: number): string {
  // Default target if nothing set
  const target = new Date("2026-05-16T10:00:00-03:00").getTime();
  return new Date(target + deltaMs).toISOString();
}
