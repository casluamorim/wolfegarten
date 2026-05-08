import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteContent } from "./use-site-content";
import { now as simNow, onSimChange } from "@/lib/simulation";

export type LaunchPhase = "pre" | "post";

function publicUrl(path: string) {
  return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
}

/** Re-renders when simulated date changes. */
export function useSimTick() {
  const [, setTick] = useState(0);
  useEffect(() => onSimChange(() => setTick((n) => n + 1)), []);
}

export function useLaunchPhase(): LaunchPhase {
  const { data } = useSiteContent();
  useSimTick();
  const mode = (data?.["launch.mode"] as string) ?? "auto";
  if (mode === "pre") return "pre";
  if (mode === "post") return "post";
  const dateStr = (data?.["launch.date"] as string) ?? "";
  const t = new Date(dateStr).getTime();
  if (Number.isNaN(t)) return "pre";
  return simNow() >= t ? "post" : "pre";
}

export function useSectionVisible(id: string, defaultVisible = true): boolean {
  const { data } = useSiteContent();
  const v = data?.[`section.${id}.visible`];
  if (typeof v === "boolean") return v;
  return defaultVisible;
}

export interface GalleryImage {
  id: string;
  url: string;
  storage_path: string;
  active: boolean;
  sort_order: number;
}

export function useGallery(assetKey: string) {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel(`gallery_${assetKey}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_galleries", filter: `asset_key=eq.${assetKey}` },
        () => qc.invalidateQueries({ queryKey: ["gallery", assetKey] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [assetKey, qc]);

  return useQuery({
    queryKey: ["gallery", assetKey],
    queryFn: async (): Promise<GalleryImage[]> => {
      const { data, error } = await supabase
        .from("site_galleries")
        .select("id, storage_path, active, sort_order")
        .eq("asset_key", assetKey)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        storage_path: r.storage_path,
        active: r.active,
        sort_order: r.sort_order,
        url: publicUrl(r.storage_path),
      }));
    },
    staleTime: 30_000,
  });
}

/** First active image from the gallery, or undefined. */
export function useActiveGalleryImage(assetKey: string): string | undefined {
  const { data } = useGallery(assetKey);
  return data?.find((i) => i.active)?.url;
}
