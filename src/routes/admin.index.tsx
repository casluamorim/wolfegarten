import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ALL_ASSET_KEYS, ASSET_LABELS, type AssetKey } from "@/hooks/use-site-asset";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({ meta: [{ title: "Admin · Wölfegarten" }, { name: "robots", content: "noindex" }] }),
});

function AdminPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"leads" | "imagens">("leads");

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/admin/login" });
  }, [loading, session, navigate]);

  const isAdmin = useQuery({
    enabled: !!session,
    queryKey: ["is-admin", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session!.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  if (loading || !session) return null;

  if (isAdmin.isLoading)
    return <div className="p-10 text-center text-sm text-muted-foreground">Carregando...</div>;

  if (!isAdmin.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="font-serif text-2xl text-offwhite">Acesso restrito</h1>
        <p className="text-sm text-muted-foreground">
          Sua conta não tem permissão de administrador.
        </p>
        <button onClick={() => supabase.auth.signOut()} className="btn-ghost-luxe">
          Sair
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <Link to="/" className="text-[11px] tracking-luxe text-offwhite">
            WÖLFEGARTEN · ADMIN
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-muted-foreground">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
              className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold"
            >
              SAIR
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-8 px-6">
          {(["leads", "imagens"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-4 text-[10px] tracking-luxe transition-colors ${
                tab === t ? "border-b border-gold text-gold" : "text-muted-foreground"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12">
        {tab === "leads" ? <LeadsPanel /> : <ImagesPanel />}
      </main>
    </div>
  );
}

function LeadsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ["Data", "Nome", "Telefone", "E-mail", "Cidade", "Como conheceu"],
      ...data.map((l) => [
        new Date(l.created_at).toLocaleString("pt-BR"),
        l.nome,
        l.telefone,
        l.email,
        l.cidade ?? "",
        l.como_conheceu ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-wolfegarten-${Date.now()}.csv`;
    a.click();
  };

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando leads...</p>;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-3xl text-offwhite">Leads</h2>
          <p className="mt-1 text-xs text-muted-foreground">{data?.length ?? 0} confirmações</p>
        </div>
        <button onClick={exportCsv} className="btn-ghost-luxe">
          Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-[10px] tracking-luxe text-muted-foreground">
            <tr>
              {["DATA", "NOME", "TELEFONE", "E-MAIL", "CIDADE", "ORIGEM", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((l) => (
              <tr key={l.id} className="border-t border-border text-offwhite/80">
                <td className="px-4 py-3 text-xs">
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                </td>
                <td className="px-4 py-3">{l.nome}</td>
                <td className="px-4 py-3">
                  <a
                    href={`https://wa.me/${l.telefone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-gold"
                  >
                    {l.telefone}
                  </a>
                </td>
                <td className="px-4 py-3">{l.email}</td>
                <td className="px-4 py-3">{l.cidade ?? "—"}</td>
                <td className="px-4 py-3">{l.como_conheceu ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => confirm("Excluir este lead?") && del.mutate(l.id)}
                    className="text-[10px] tracking-luxe text-muted-foreground hover:text-destructive"
                  >
                    EXCLUIR
                  </button>
                </td>
              </tr>
            ))}
            {!data?.length && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  Nenhum lead ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ImagesPanel() {
  return (
    <div>
      <h2 className="font-serif text-3xl text-offwhite">Imagens & Logos</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Faça upload em JPG ou PNG. As alterações aparecem no site automaticamente.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {ALL_ASSET_KEYS.map((k) => (
          <AssetCard key={k} assetKey={k} />
        ))}
      </div>
    </div>
  );
}

function AssetCard({ assetKey }: { assetKey: AssetKey }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const current = useQuery({
    queryKey: ["asset", assetKey],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_assets")
        .select("storage_path")
        .eq("asset_key", assetKey)
        .maybeSingle();
      if (!data) return null;
      return supabase.storage.from("site-assets").getPublicUrl(data.storage_path).data.publicUrl;
    },
  });

  const onUpload = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      if (file.size > 8 * 1024 * 1024) throw new Error("Máx 8MB");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${assetKey}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("site-assets").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (up.error) throw up.error;
      const { error } = await supabase
        .from("site_assets")
        .upsert({ asset_key: assetKey, storage_path: path }, { onConflict: "asset_key" });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["asset", assetKey] });
      await qc.invalidateQueries({ queryKey: ["site-assets"] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  };

  const isLogo = assetKey.startsWith("logo-");

  return (
    <div className="glass-card p-6">
      <div className="text-[10px] tracking-luxe text-gold">{ASSET_LABELS[assetKey]}</div>
      <div
        className={`mt-4 flex items-center justify-center overflow-hidden rounded border border-border bg-background ${
          isLogo ? "h-28" : "h-40"
        }`}
      >
        {current.data ? (
          <img
            src={current.data}
            alt={ASSET_LABELS[assetKey]}
            className={isLogo ? "max-h-20 object-contain" : "h-full w-full object-cover"}
          />
        ) : (
          <span className="text-[10px] tracking-luxe text-muted-foreground">SEM IMAGEM</span>
        )}
      </div>
      <label className="mt-4 block">
        <input
          type="file"
          accept={isLogo ? "image/png,image/svg+xml,image/webp" : "image/jpeg,image/png,image/webp"}
          className="hidden"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        <span className="btn-ghost-luxe block w-full cursor-pointer text-center">
          {busy ? "Enviando..." : "Trocar imagem"}
        </span>
      </label>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
