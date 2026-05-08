import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContentMap = Record<string, unknown>;

export function useSiteContent() {
  const qc = useQueryClient();

  useEffect(() => {
    const ch = supabase
      .channel("site_content_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_content" },
        () => qc.invalidateQueries({ queryKey: ["site-content"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("key, value");
      if (error) throw error;
      const map: ContentMap = {};
      for (const r of data ?? []) map[r.key] = r.value;
      return map;
    },
    staleTime: 30_000,
  });
}

export function useText(key: string, fallback = ""): string {
  const { data } = useSiteContent();
  const v = data?.[key];
  return typeof v === "string" ? v : fallback;
}
