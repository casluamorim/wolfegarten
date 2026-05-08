import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "@/hooks/use-site-content";
import { useLaunchPhase } from "@/hooks/use-launch";

const SECTIONS: { id: string; label: string; phaseNote?: string }[] = [
  { id: "countdown", label: "Contagem regressiva", phaseNote: "Visível somente na Fase 1" },
  { id: "institucional", label: "Seção institucional", phaseNote: "Visível somente na Fase 2" },
  { id: "marco", label: "Seção 'Um novo marco'" },
  { id: "experience", label: "Seção 'A Experiência'" },
  { id: "info", label: "Seção Informações (Local/Data/Horário)", phaseNote: "Visível somente na Fase 1" },
  { id: "vagas", label: "Seção 'Vagas Limitadas'", phaseNote: "Visível somente na Fase 1" },
  { id: "confirm", label: "Formulário de Confirmação" },
];

export function PhasePanel() {
  const { data } = useSiteContent();
  const phase = useLaunchPhase();

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Fase & Seções</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Configure a data oficial e mostre/oculte seções do site. Mudanças aplicam imediatamente.
        </p>
      </div>

      <div className="rounded border border-border bg-card/40 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-offwhite">Status atual</h3>
          <span
            className={`rounded px-3 py-1 text-[10px] tracking-luxe ${
              phase === "post" ? "bg-gold/20 text-gold" : "bg-muted text-muted-foreground"
            }`}
          >
            {phase === "post" ? "FASE 2 — INSTITUCIONAL" : "FASE 1 — PRÉ-LANÇAMENTO"}
          </span>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <DateField
            label="Data oficial do lançamento"
            value={typeof data?.["launch.date"] === "string" ? (data["launch.date"] as string) : ""}
            contentKey="launch.date"
            hint="O site alterna automaticamente para a Fase 2 nesta data."
          />
          <ModeField
            value={typeof data?.["launch.mode"] === "string" ? (data["launch.mode"] as string) : "auto"}
          />
        </div>
      </div>

      <div className="mt-8 rounded border border-border bg-card/40 p-5">
        <h3 className="text-sm text-offwhite">Visibilidade das seções</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Desligue para ocultar a seção do site público.
        </p>
        <div className="mt-5 space-y-2">
          {SECTIONS.map((s) => (
            <SectionToggle key={s.id} id={s.id} label={s.label} note={s.phaseNote} value={data?.[`section.${s.id}.visible`]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function saveContent(key: string, value: unknown) {
  return supabase
    .from("site_content")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
}

function DateField({
  label,
  value,
  contentKey,
  hint,
}: {
  label: string;
  value: string;
  contentKey: string;
  hint?: string;
}) {
  // Convert ISO -> input datetime-local format (YYYY-MM-DDTHH:mm)
  const toLocal = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const tz = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 16);
  };
  const [val, setVal] = useState(toLocal(value));
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const last = useRef(value);

  useEffect(() => {
    if (value !== last.current) {
      setVal(toLocal(value));
      last.current = value;
    }
  }, [value]);

  const onChange = async (next: string) => {
    setVal(next);
    if (!next) return;
    const iso = new Date(next).toISOString();
    const { error } = await saveContent(contentKey, iso);
    setStatus(error ? "error" : "saved");
    setTimeout(() => setStatus("idle"), 1200);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-[10px] tracking-luxe text-muted-foreground">{label}</label>
        <span className="text-[9px] tracking-luxe text-muted-foreground/60">
          {status === "saved" && "✓ salvo"}
          {status === "error" && "erro"}
        </span>
      </div>
      <input
        type="datetime-local"
        value={val}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
      />
      {hint && <p className="mt-1 text-[10px] text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function ModeField({ value }: { value: string }) {
  const [val, setVal] = useState(value);
  useEffect(() => setVal(value), [value]);

  const onChange = async (next: string) => {
    setVal(next);
    await saveContent("launch.mode", next);
  };

  return (
    <div>
      <label className="text-[10px] tracking-luxe text-muted-foreground">Modo da fase</label>
      <select
        value={val}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded border border-border bg-background px-3 py-2 text-sm text-offwhite outline-none focus:border-gold"
      >
        <option value="auto">Automático (pela data)</option>
        <option value="pre">Forçar Fase 1 — Pré-lançamento</option>
        <option value="post">Forçar Fase 2 — Institucional</option>
      </select>
      <p className="mt-1 text-[10px] text-muted-foreground/70">
        Use "Automático" para alternar sozinho na data acima.
      </p>
    </div>
  );
}

function SectionToggle({
  id,
  label,
  note,
  value,
}: {
  id: string;
  label: string;
  note?: string;
  value: unknown;
}) {
  const initial = typeof value === "boolean" ? value : true;
  const [on, setOn] = useState(initial);
  useEffect(() => setOn(typeof value === "boolean" ? value : true), [value]);

  const toggle = async () => {
    const next = !on;
    setOn(next);
    await saveContent(`section.${id}.visible`, next);
  };

  return (
    <div className="flex items-center justify-between rounded border border-border bg-background/40 px-4 py-3">
      <div>
        <div className="text-sm text-offwhite">{label}</div>
        {note && <div className="text-[10px] text-muted-foreground/70">{note}</div>}
      </div>
      <button
        onClick={toggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          on ? "bg-gold/80" : "bg-muted"
        }`}
        aria-pressed={on}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
