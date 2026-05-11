import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ALL_ASSET_KEYS, ASSET_LABELS, type AssetKey } from "@/hooks/use-site-asset";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { LivePreview } from "@/components/admin/LivePreview";
import { LogosPanel } from "@/components/admin/LogosPanel";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { SimulationPanel } from "@/components/admin/SimulationPanel";
import { useSimulation } from "@/hooks/use-simulation";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin · Wölfegarten" }, { name: "robots", content: "noindex" }],
  }),
});

type Tab = "editar" | "midia" | "logos" | "config" | "leads" | "preview";

const TABS: { id: Tab; label: string }[] = [
  { id: "editar", label: "EDITAR SITE" },
  { id: "midia", label: "MÍDIA" },
  { id: "logos", label: "LOGOS" },
  { id: "config", label: "CONFIGURAÇÕES" },
  { id: "leads", label: "LEADS" },
  { id: "preview", label: "PREVIEW & SIMULAÇÃO" },
];

// Tudo que não é logo categorizada continua na aba Mídia.
// A "logo-main" continua editável aqui (única identificada).
const MEDIA_KEYS: AssetKey[] = ALL_ASSET_KEYS.filter(
  (k) => !k.startsWith("logo-") || k === "logo-main",
);

function AdminPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("editar");
  const sim = useSimulation();

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
        <p className="text-sm text-muted-foreground">Sua conta não tem permissão de administrador.</p>
        <button onClick={() => supabase.auth.signOut()} className="btn-ghost-luxe">Sair</button>
      </div>
    );
  }

  const showPreview = tab === "editar" || tab === "midia" || tab === "logos";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-6">
          <Link to="/" className="text-[11px] tracking-luxe text-offwhite">
            WÖLFEGARTEN · ADMIN
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden text-[10px] text-muted-foreground md:inline">{session.user.email}</span>
            <button
              onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
              className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold"
            >
              SAIR
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1600px] gap-5 overflow-x-auto px-4 md:gap-8 md:px-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap pb-4 text-[10px] tracking-luxe transition-colors ${
                tab === t.id ? "border-b border-gold text-gold" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {sim.enabled && (
        <div className="border-b border-gold/40 bg-gold/10 px-4 py-2 text-center text-[10px] tracking-luxe text-gold">
          MODO SIMULAÇÃO ATIVO · {sim.iso ? new Date(sim.iso).toLocaleString("pt-BR") : "data não definida"}
          <button onClick={sim.clear} className="ml-3 underline hover:text-offwhite">desligar</button>
        </div>
      )}

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className={showPreview ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}>
          <div>
            {tab === "editar" && <ContentEditor />}
            {tab === "midia" && (
              <div className="space-y-10">
                <MediaLibrary />
                <div>
                  <h3 className="font-serif text-2xl text-offwhite">Identidade & assets fixos</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Logo principal e assets identificados (opcional — uso legado).</p>
                  <div className="mt-6"><AssetsPanel keys={MEDIA_KEYS} title="" /></div>
                </div>
              </div>
            )}
            {tab === "logos" && <LogosPanel />}
            {tab === "config" && <SettingsPanel />}
            {tab === "leads" && <LeadsPanel />}
            {tab === "preview" && <SimulationPanel />}
          </div>
          {showPreview && <LivePreview />}
        </div>
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
        <button onClick={exportCsv} className="btn-ghost-luxe">Exportar CSV</button>
      </div>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full text-sm">
          <thead className="bg-card text-[10px] tracking-luxe text-muted-foreground">
            <tr>
              {["DATA", "NOME", "TELEFONE", "E-MAIL", "CIDADE", "ORIGEM", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((l) => (
              <tr key={l.id} className="border-t border-border text-offwhite/80">
                <td className="px-4 py-3 text-xs">{new Date(l.created_at).toLocaleString("pt-BR")}</td>
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

function AssetsPanel({ keys, title }: { keys: AssetKey[]; title: string }) {
  return (
    <div>
      <h2 className="font-serif text-3xl text-offwhite">{title}</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Hero, seção Experiência, fundo final e logo principal. As demais logos ficam na aba <strong>Logos</strong>.
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {keys.map((k) => (
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
  const [drag, setDrag] = useState(false);

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
      const isVideo = file.type.startsWith("video/");
      const limit = isVideo ? 2 * 1024 * 1024 * 1024 : 50 * 1024 * 1024;
      if (file.size > limit) throw new Error(isVideo ? "Vídeo acima de 2GB" : "Imagem acima de 50MB");
      const { toWebpIfRaster } = await import("@/lib/img-to-webp");
      const optimized = isVideo ? file : await toWebpIfRaster(file, 0.9, 3200);
      const ext = optimized.name.split(".").pop()?.toLowerCase() ?? (isVideo ? "mp4" : "webp");
      const path = `${assetKey}-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("site-assets").upload(path, optimized, {
        cacheControl: "31536000",
        upsert: false,
        contentType: optimized.type || file.type,
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
    <div className="glass-card p-5">
      <div className="text-[10px] tracking-luxe text-gold">{ASSET_LABELS[assetKey]}</div>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onUpload(f);
        }}
        className={`mt-4 flex cursor-pointer items-center justify-center overflow-hidden rounded border-2 border-dashed bg-background transition-colors ${
          drag ? "border-gold bg-gold/5" : "border-border hover:border-gold/50"
        } ${isLogo ? "h-28" : "h-40"}`}
      >
        <input
          type="file"
          accept={isLogo ? "image/png,image/svg+xml,image/webp,image/jpeg" : "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"}
          className="hidden"
          disabled={busy}
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
        {current.data ? (
          <img
            src={current.data}
            alt={ASSET_LABELS[assetKey]}
            className={isLogo ? "max-h-20 object-contain" : "h-full w-full object-cover"}
          />
        ) : (
          <span className="text-[10px] tracking-luxe text-muted-foreground">
            {busy ? "ENVIANDO..." : "ARRASTE OU CLIQUE (até 2GB para vídeos)"}
          </span>
        )}
      </label>
      {err && <p className="mt-2 text-xs text-destructive">{err}</p>}
    </div>
  );
}
