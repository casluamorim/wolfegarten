import { useEffect, useState } from "react";
import { useText } from "@/hooks/use-site-content";

const KEY = "wg_sim_v1";

type SimState = { enabled: boolean; iso: string | null };

function read(): SimState {
  if (typeof window === "undefined") return { enabled: false, iso: null };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { enabled: false, iso: null };
    return JSON.parse(raw) as SimState;
  } catch {
    return { enabled: false, iso: null };
  }
}

function write(s: SimState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("wg-sim-change"));
}

export function useSimulation() {
  const [state, setState] = useState<SimState>(() => read());

  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener("wg-sim-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("wg-sim-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return {
    ...state,
    setEnabled: (v: boolean) => write({ ...state, enabled: v }),
    setIso: (iso: string | null) => write({ ...state, iso }),
    clear: () => write({ enabled: false, iso: null }),
  };
}

/** Now em ms, considerando simulação se ativa. */
export function useSimulatedNow(): number {
  const { enabled, iso } = useSimulation();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);
  if (enabled && iso) {
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : Date.now();
  }
  void tick;
  return Date.now();
}

/** "pre" antes da data alvo, "live" depois (respeita simulação). */
export function useLaunchPhase(): "pre" | "live" {
  const target = useText("countdown.target_date", "2026-05-16T10:00:00-03:00");
  const auto = useText("launch.auto_switch", "true") !== "false";
  const forced = useText("launch.phase", "pre");
  const now = useSimulatedNow();
  if (forced === "live") return "live";
  if (forced === "pre" && !auto) return "pre";
  const t = new Date(target).getTime();
  return Number.isFinite(t) && now >= t ? "live" : "pre";
}
