import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { LivePreview } from "@/components/admin/LivePreview";
import { PhasePanel } from "@/components/admin/PhasePanel";
import { MediaPanel } from "@/components/admin/MediaPanel";
import { SettingsPanel } from "@/components/admin/SettingsPanel";

export const Route = createFileRoute("/admin/")({
  component: AdminPage,
  head: () => ({
    meta: [{ title: "Admin · Wölfegarten" }, { name: "robots", content: "noindex" }],
  }),
});

type Tab = "editar" | "midia" | "config" | "fase" | "leads";

const TABS: { id: Tab; label: string }[] = [
  { id: "editar", label: "EDITAR SITE" },
  { id: "midia", label: "MÍDIA" },
  { id: "config", label: "CONFIGURAÇÕES" },
  { id: "fase", label: "FASE & SIMULADOR" },
  { id: "leads", label: "LEADS" },
];

function AdminPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("editar");

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

  const showPreview = tab !== "leads";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 md:px-6 md:py-6">
          <Link to="/" className="text-[11px] tracking-luxe text-offwhite">
            WÖLFEGARTEN · ADMIN
          </Link>
          <div className="flex items-center gap-3 md:gap-4">
            <span className="hidden text-[10px] text-muted-foreground sm:inline">
              {session.user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
              className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold"
            >
              SAIR
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1600px] gap-4 overflow-x-auto px-4 md:gap-8 md:px-6">
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

      <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6 md:py-8">
        <div className={showPreview ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}>
          <div>
            {tab === "editar" && <ContentEditor />}
            {tab === "fase" && <PhasePanel />}
            {tab === "midia" && <MediaPanel />}
            {tab === "config" && <SettingsPanel />}
            {tab === "leads" && <LeadsPanel />}
          </div>
          {showPreview && (
            <div className="hidden lg:block">
              <LivePreview />
            </div>
          )}
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
