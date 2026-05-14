import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSiteContent } from "@/hooks/use-site-content";
import { FieldRow, type ContentSection } from "@/components/admin/ContentEditor";
import { PHASE2_SECTIONS } from "@/components/admin/phase2-sections";

export const Route = createFileRoute("/admin/preview/$page")({
  component: PreviewPage,
  head: () => ({
    meta: [{ title: "Editar Fase 2 · Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const PAGES = [
  { id: "home", label: "Home Institucional", path: "/" },
  { id: "empreendimento", label: "Empreendimento", path: "/empreendimento" },
  { id: "infraestrutura", label: "Infraestrutura", path: "/infraestrutura" },
  { id: "lazer", label: "Áreas de Lazer", path: "/lazer" },
  { id: "masterplan", label: "Masterplan", path: "/masterplan" },
  { id: "galeria", label: "Galeria", path: "/galeria" },
  { id: "videos", label: "Vídeos", path: "/videos" },
  { id: "localizacao", label: "Localização", path: "/localizacao" },
  { id: "contato", label: "Contato", path: "/contato" },
];

function PreviewPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { page } = Route.useParams();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/admin/login" });
  }, [loading, session, navigate]);

  if (loading || !session) return null;

  const sections = PHASE2_SECTIONS[page] ?? [];
  const pageMeta = PAGES.find((p) => p.id === page);
  const previewPath = pageMeta?.path ?? "/";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-gold/30 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-6 py-3">
          <div className="text-[10px] tracking-luxe text-gold">EDITAR FASE 2 · INTERNO</div>
          <Link to="/admin" className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold">
            ← VOLTAR AO ADMIN
          </Link>
        </div>
        <nav className="mx-auto flex max-w-[1800px] gap-4 overflow-x-auto px-6 pb-3">
          {PAGES.map((p) => (
            <Link
              key={p.id}
              to="/admin/preview/$page"
              params={{ page: p.id }}
              className={`whitespace-nowrap text-[10px] tracking-luxe transition-colors ${
                page === p.id ? "text-gold" : "text-muted-foreground hover:text-offwhite"
              }`}
            >
              {p.label.toUpperCase()}
            </Link>
          ))}
        </nav>
      </header>

      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[480px_minmax(0,1fr)]">
        <aside className="overflow-y-auto border-r border-border bg-background p-6 lg:max-h-[calc(100vh-92px)]">
          <h2 className="font-serif text-2xl text-offwhite">{pageMeta?.label ?? page}</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Edição completa da Fase 2. Mudanças aparecem no preview ao lado em tempo real.
            Nada disto fica visível publicamente até a ativação oficial.
          </p>
          <div className="mt-6">
            <SectionList sections={sections} />
          </div>
        </aside>

        <section className="bg-card/30">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="text-[10px] tracking-luxe text-muted-foreground">PREVIEW · FASE 2 (modo simulação)</span>
            <a
              href={`${previewPath}?simulate=live`}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] tracking-luxe text-gold hover:text-offwhite"
            >
              ABRIR EM NOVA ABA ↗
            </a>
          </div>
          <iframe
            key={page}
            src={`${previewPath}?simulate=live`}
            title={`Preview ${page}`}
            className="h-[calc(100vh-128px)] w-full border-0 bg-background"
          />
        </section>
      </div>
    </div>
  );
}

function SectionList({ sections }: { sections: ContentSection[] }) {
  const { data, isLoading } = useSiteContent();
  const [openId, setOpenId] = useState<string>(sections[0]?.id ?? "");

  // reset open when sections change (page navigation)
  const firstId = sections[0]?.id ?? "";
  const ids = useMemo(() => sections.map((s) => s.id).join(","), [sections]);
  useEffect(() => {
    setOpenId(firstId);
  }, [ids, firstId]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando...</p>;
  if (!sections.length)
    return <p className="text-sm text-muted-foreground">Sem campos editáveis para esta página.</p>;

  return (
    <div className="space-y-3">
      {sections.map((s) => (
        <div key={s.id} className="overflow-hidden rounded border border-border">
          <button
            onClick={() => setOpenId(openId === s.id ? "" : s.id)}
            className="flex w-full items-center justify-between bg-card px-4 py-3 text-left transition-colors hover:bg-card/70"
          >
            <div>
              <div className="text-sm text-offwhite">{s.title}</div>
              {s.description && (
                <div className="mt-1 text-[11px] text-muted-foreground">{s.description}</div>
              )}
            </div>
            <span className="text-gold">{openId === s.id ? "−" : "+"}</span>
          </button>
          {openId === s.id && (
            <div className="space-y-5 border-t border-border bg-background/50 p-4">
              {s.fields.map((f) => (
                <FieldRow
                  key={f.key}
                  field={f}
                  value={typeof data?.[f.key] === "string" ? (data[f.key] as string) : ""}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
