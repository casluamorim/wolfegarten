import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type MediaKind = "image" | "video" | "logo" | "render";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  storage_path: string;
  mime: string | null;
  bytes: number | null;
  width: number | null;
  height: number | null;
  duration: number | null;
  poster_path: string | null;
  variants: Record<string, unknown>;
  alt: string | null;
  tags: string[];
  created_at: string;
}

export interface MediaItemWithUrl extends MediaItem {
  url: string;
  posterUrl: string | null;
}

function publicUrl(path: string) {
  return supabase.storage.from("site-assets").getPublicUrl(path).data.publicUrl;
}

export function useMediaLibrary(filter?: { kind?: MediaKind | "all"; search?: string }) {
  const qc = useQueryClient();
  const kind = filter?.kind ?? "all";
  const search = filter?.search ?? "";

  useEffect(() => {
    const ch = supabase
      .channel(`media_library_${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "media_library" },
        () => qc.invalidateQueries({ queryKey: ["media-library"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  return useQuery<MediaItemWithUrl[]>({
    queryKey: ["media-library", kind, search],
    queryFn: async () => {
      // typed as any — types.ts ainda não conhece a tabela nova
      const client = supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            order: (c: string, o: { ascending: boolean }) => Promise<{ data: MediaItem[] | null; error: unknown }>;
          };
        };
      };
      const { data, error } = await client
        .from("media_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      let rows = (data ?? []) as MediaItem[];
      if (kind !== "all") rows = rows.filter((r) => r.kind === kind);
      if (search.trim()) {
        const q = search.toLowerCase();
        rows = rows.filter(
          (r) =>
            (r.alt ?? "").toLowerCase().includes(q) ||
            r.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }
      return rows.map((r) => ({
        ...r,
        url: publicUrl(r.storage_path),
        posterUrl: r.poster_path ? publicUrl(r.poster_path) : null,
      }));
    },
    staleTime: 15_000,
  });
}
