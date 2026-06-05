import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardStats } from "@/lib/admin-users.functions";
import { Users, Calendar, TrendingUp, Image as ImageIcon } from "lucide-react";

export function Dashboard({ onGoLeads }: { onGoLeads?: () => void }) {
  const fetchStats = useServerFn(getDashboardStats);
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => fetchStats(),
    refetchInterval: 60_000,
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando dashboard...</p>;
  if (error) return <p className="text-sm text-destructive">{(error as Error).message}</p>;
  if (!data) return null;

  const cards = [
    { label: "LEADS HOJE", value: data.totals.today, icon: Calendar },
    { label: "ÚLTIMOS 7 DIAS", value: data.totals.last7, icon: TrendingUp },
    { label: "ÚLTIMOS 30 DIAS", value: data.totals.last30, icon: TrendingUp },
    { label: "TOTAL DE LEADS", value: data.totals.leads, icon: Users },
    { label: "MÍDIAS NA BIBLIOTECA", value: data.totals.media, icon: ImageIcon },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-3xl text-offwhite">Dashboard</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Visão geral em tempo real. Atualiza automaticamente.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] tracking-luxe text-muted-foreground">{c.label}</span>
              <c.icon className="h-4 w-4 text-gold" />
            </div>
            <div className="mt-3 font-serif text-3xl text-offwhite">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm text-offwhite">Leads recentes</h3>
            {onGoLeads && (
              <button
                onClick={onGoLeads}
                className="text-[10px] tracking-luxe text-gold hover:underline"
              >
                VER TODOS →
              </button>
            )}
          </div>
          <div className="space-y-3">
            {data.recent.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum lead ainda.</p>
            )}
            {data.recent.map((l) => (
              <div
                key={l.id}
                className="flex items-start justify-between gap-3 border-b border-border/50 pb-3 last:border-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm text-offwhite">{l.nome}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {l.telefone} · {l.cidade ?? "—"}
                  </div>
                </div>
                <div className="shrink-0 text-[10px] text-muted-foreground">
                  {new Date(l.created_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <RankingCard title="Cidades dos leads" entries={data.topCities} />
          <RankingCard title="Como conheceu" entries={data.topOrigins} />
        </div>
      </div>
    </div>
  );
}

function RankingCard({ title, entries }: { title: string; entries: [string, number][] }) {
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return (
    <div className="rounded border border-border bg-card p-5">
      <h3 className="mb-4 text-sm text-offwhite">{title}</h3>
      {entries.length === 0 && (
        <p className="text-xs text-muted-foreground">Sem dados ainda.</p>
      )}
      <div className="space-y-2">
        {entries.map(([label, n]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-[11px]">
              <span className="truncate text-offwhite/80">{label}</span>
              <span className="text-muted-foreground">{n}</span>
            </div>
            <div className="mt-1 h-1 rounded bg-background">
              <div
                className="h-full rounded bg-gold/60"
                style={{ width: `${(n / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
