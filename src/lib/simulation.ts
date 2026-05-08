// Date simulator (admin-only, browser-local). Does NOT change real data.
const KEY = "wg.sim.iso"; // ISO datetime or "" / null
const EVT = "wg-sim-change";

export function getSimulatedDate(): Date | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function setSimulatedDate(iso: string | null) {
  if (typeof window === "undefined") return;
  if (iso) window.localStorage.setItem(KEY, iso);
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVT));
}

export function now(): number {
  return getSimulatedDate()?.getTime() ?? Date.now();
}

export function onSimChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}
