import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useText } from "@/hooks/use-site-content";
import { Footer } from "@/components/Footer";
import { useSiteAsset } from "@/hooks/use-site-asset";
import heroFallback from "@/assets/hero-wolfegarten.jpg";

export const Route = createFileRoute("/admin/preview/$page")({
  component: PreviewPage,
  head: () => ({
    meta: [{ title: "Preview Fase 2 · Admin" }, { name: "robots", content: "noindex" }],
  }),
});

const PAGES = [
  { id: "home", label: "Home Institucional" },
  { id: "empreendimento", label: "Empreendimento" },
  { id: "infraestrutura", label: "Infraestrutura" },
  { id: "lazer", label: "Áreas de Lazer" },
  { id: "masterplan", label: "Masterplan" },
  { id: "galeria", label: "Galeria" },
  { id: "videos", label: "Vídeos" },
  { id: "localizacao", label: "Localização" },
  { id: "contato", label: "Contato" },
];

function PreviewPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const { page } = Route.useParams();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/admin/login" });
  }, [loading, session, navigate]);

  if (loading || !session) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-gold/30 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-3">
          <div className="text-[10px] tracking-luxe text-gold">PREVIEW FASE 2 · INTERNO</div>
          <Link to="/admin" className="text-[10px] tracking-luxe text-muted-foreground hover:text-gold">← VOLTAR AO ADMIN</Link>
        </div>
        <nav className="mx-auto flex max-w-[1600px] gap-4 overflow-x-auto px-6 pb-3">
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

      <PreviewContent page={page} />
      <Footer />
    </div>
  );
}

function PreviewContent({ page }: { page: string }) {
  switch (page) {
    case "home":
      return <Phase2Home />;
    case "empreendimento":
      return <SimpleSection sectionKey="empreendimento" />;
    case "infraestrutura":
      return <SimpleSection sectionKey="infraestrutura" />;
    case "lazer":
      return <SimpleSection sectionKey="lazer" />;
    case "masterplan":
      return <SimpleSection sectionKey="masterplan" />;
    case "galeria":
      return <Phase2Gallery />;
    case "videos":
      return <Phase2Videos />;
    case "localizacao":
      return <SimpleSection sectionKey="localizacao" />;
    case "contato":
      return <Phase2Contato />;
    default:
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">Página não encontrada.</p>
        </div>
      );
  }
}

function Phase2Home() {
  const t1 = useText("phase2.hero.title_line1", "Wölfegarten");
  const t2 = useText("phase2.hero.title_line2", "Indaial");
  const sub = useText("phase2.hero.subtitle", "Um novo padrão de viver.");
  const cta = useText("phase2.hero.cta", "Agendar uma Visita");
  const img = useSiteAsset("hero", heroFallback);

  return (
    <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
      <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/70" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-5xl font-light text-offwhite md:text-7xl">
          {t1}
          <br />
          <span className="text-gold">{t2}</span>
        </h1>
        <p className="mt-6 max-w-md text-sm text-offwhite/80">{sub}</p>
        <a href="#contato" className="btn-luxe mt-10">{cta}</a>
      </div>
    </section>
  );
}

function SimpleSection({ sectionKey }: { sectionKey: string }) {
  const title = useText(`phase2.${sectionKey}.title`, sectionKey);
  const text = useText(`phase2.${sectionKey}.text`, "Edite no painel admin → Editar Site (chaves phase2.*)");
  return (
    <section className="mx-auto max-w-4xl px-6 py-24 text-center">
      <h2 className="font-serif text-4xl text-offwhite">{title}</h2>
      <div className="mx-auto my-8 h-px w-16 bg-gold" />
      <p className="text-base text-offwhite/80">{text}</p>
    </section>
  );
}

function Phase2Gallery() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="font-serif text-4xl text-offwhite text-center">Galeria</h2>
      <div className="mx-auto my-8 h-px w-16 bg-gold" />
      <p className="text-center text-sm text-muted-foreground">
        Preencha imagens e renders na biblioteca de mídia. A galeria será conectada ao painel.
      </p>
      <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square rounded border border-dashed border-border bg-card" />
        ))}
      </div>
    </section>
  );
}

function Phase2Videos() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <h2 className="font-serif text-4xl text-offwhite text-center">Vídeos</h2>
      <div className="mx-auto my-8 h-px w-16 bg-gold" />
      <div className="aspect-video rounded border border-dashed border-border bg-card" />
    </section>
  );
}

function Phase2Contato() {
  const title = useText("phase2.contato.title", "Agende sua Visita");
  const sub = useText("phase2.contato.subtitle", "Nossa equipe está pronta.");
  const cta = useText("phase2.confirm.cta", "Agendar uma Visita");
  return (
    <section id="contato" className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h2 className="font-serif text-4xl text-offwhite">{title}</h2>
      <p className="mt-4 text-sm text-muted-foreground">{sub}</p>
      <button className="btn-luxe mt-10">{cta}</button>
      <p className="mt-12 text-[10px] tracking-luxe text-muted-foreground">
        FORMULÁRIO COMPLETO INTEGRADO À TABELA DE LEADS APÓS LANÇAMENTO
      </p>
    </section>
  );
}
