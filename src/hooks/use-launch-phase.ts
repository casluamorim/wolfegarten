import { useEffect, useState } from "react";
import { useSiteContent } from "@/hooks/use-site-content";

export type LaunchPhase = "pre-launch" | "live";

function readSimulate(): LaunchPhase | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const v = params.get("simulate");
  if (v === "live" || v === "pre" || v === "pre-launch") {
    return v === "live" ? "live" : "pre-launch";
  }
  return null;
}

export function useLaunchPhase(): LaunchPhase {
  const { data } = useSiteContent();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const sim = readSimulate();
  if (sim) return sim;

  const phaseRaw = (data?.["launch.phase"] as string | undefined) ?? "pre-launch";
  const auto = ((data?.["launch.auto_switch"] as string | undefined) ?? "false") === "true";
  const target = (data?.["launch.date"] as string | undefined) ?? "";
  const targetTs = target ? Date.parse(target) : Number.NaN;

  const normalized: LaunchPhase = phaseRaw === "live" ? "live" : "pre-launch";

  if (auto && Number.isFinite(targetTs) && now >= targetTs) return "live";
  return normalized;
}
