import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AssetKey =
  | "hero"
  | "experience"
  | "info"
  | "logo-zah"
  | "logo-stilo"
  | "logo-prisma";

export const ASSET_LABELS: Record<AssetKey, string> = {
  hero: "Imagem Hero (topo)",
  experience: "Imagem Experiência",
  info: "Imagem Info (final / fundo)",
  "logo-zah": "Logo ZAH",
  "logo-stilo": "Logo Stilo Legacy",
  "logo-prisma": "Logo Prisma Construtora",
};

export const ALL_ASSET_KEYS: AssetKey[] = [
  "hero",
  "experience",
  "info",
  "logo-zah",
  "logo-stilo",
  "logo-prisma",
];

function publicUrl(path: string) {
  return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
}

export function useSiteAssets() {
  return useQuery({
    queryKey: ["site-assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_assets").select("*");
      if (error) throw error;
      const map: Partial<Record<AssetKey, string>> = {};
      for (const row of data ?? []) {
        map[row.asset_key as AssetKey] = publicUrl(row.storage_path);
      }
      return map;
    },
    staleTime: 60_000,
  });
}

export function useSiteAsset(key: AssetKey, fallback?: string) {
  const { data } = useSiteAssets();
  return data?.[key] ?? fallback;
}
