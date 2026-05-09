import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PartnerLogo {
  id: string;
  storage_path: string;
  alt: string | null;
  link: string | null;
  placement: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export interface PartnerLogoWithUrl extends PartnerLogo {
  url: string;
}

export function usePartnerLogos(opts: { onlyActive?: boolean } = {}) {
  const qc = useQueryClient();
  const { onlyActive = false } = opts;

  useEffect(() => {
    const ch = supabase
      .channel(`partner_logos_${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_logos" },
        () => qc.invalidateQueries({ queryKey: ["partner-logos"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery<PartnerLogoWithUrl[]>({
    queryKey: ["partner-logos", onlyActive],
    queryFn: async () => {
      let q = supabase.from("partner_logos").select("*").order("sort_order", { ascending: true });
      if (onlyActive) q = q.eq("active", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((row) => ({
        ...row,
        url: supabase.storage.from("site-assets").getPublicUrl(row.storage_path).data.publicUrl,
      }));
    },
    staleTime: 30_000,
  });
}
