import { useState } from "react";
import { z } from "zod";
import { Reveal } from "@/components/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { useText } from "@/hooks/use-site-content";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  telefone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(120),
  cidade: z.string().trim().min(2, "Informe sua cidade").max(80),
  como_conheceu: z.string().trim().min(2, "Selecione uma opção").max(80),
});

const ORIGENS = ["Instagram", "Google", "Indicação", "WhatsApp", "Corretor", "Outro"];

interface Props {
  /** Página de origem do lead — entra na mensagem do WhatsApp para contexto. */
  origem?: string;
}

/**
 * Formulário de agendamento de visita na Central de Vendas.
 * Substitui o antigo "Confirmar presença".
 */
export function VisitForm({ origem }: Props) {
  const eyebrow = useText("visit.eyebrow", "AGENDE SUA VISITA");
  const title = useText("visit.title", "Conheça o Wölfegarten pessoalmente");
  const subtitle = useText(
    "visit.subtitle",
    "Visite nossa Central de Vendas e viva a experiência presencial.",
  );
  const ctaLabel = useText("visit.cta", "Solicitar agendamento");
  const contactName = useText("visit.contact_name", "Atendimento Wölfegarten");
  const contactPhone = useText("visit.contact_phone_display", "(47) 98817-8508");
  const whatsapp = useText("contact.whatsapp", "5547988178508");
  const salesAddress = useText("sales.address", "");

  const [data, setData] = useState({
    nome: "",
    telefone: "",
    email: "",
    cidade: "",
    como_conheceu: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(data);
    if (!r.success) {
      setErr(r.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setErr(null);
    setBusy(true);
    const { error } = await supabase.from("leads").insert(r.data);
    setBusy(false);
    if (error) {
      setErr("Não foi possível registrar. Tente novamente.");
      return;
    }
    setSent(true);
    const linhas = [
      `*Agendamento de visita — Wölfegarten*`,
      origem ? `*Página:* ${origem}` : null,
      ``,
      `*Nome:* ${r.data.nome}`,
      `*Telefone:* ${r.data.telefone}`,
      `*E-mail:* ${r.data.email}`,
      `*Cidade:* ${r.data.cidade}`,
      `*Como conheceu:* ${r.data.como_conheceu}`,
      salesAddress ? `` : null,
      salesAddress ? `Tenho interesse em visitar a Central de Vendas em ${salesAddress}.` : null,
    ].filter(Boolean);
    const msg = encodeURIComponent(linhas.join("\n"));
    window.open(`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
    setData({ nome: "", telefone: "", email: "", cidade: "", como_conheceu: "" });
  };

  const fields: { name: keyof typeof data; label: string; type?: string }[] = [
    { name: "nome", label: "NOME" },
    { name: "telefone", label: "TELEFONE / WHATSAPP" },
    { name: "email", label: "E-MAIL", type: "email" },
    { name: "cidade", label: "CIDADE" },
  ];

  return (
    <section id="agendar-visita" className="bg-forest-deep py-20 md:py-28">
      <div className="mx-auto max-w-xl px-6 text-center">
        <Reveal>
          <div className="text-[10px] tracking-luxe text-gold">{eyebrow}</div>
          <div className="mx-auto my-6 gold-divider" />
          <h2 className="font-serif text-3xl font-light text-offwhite md:text-5xl">{title}</h2>
          <p className="mt-6 text-sm font-light text-muted-foreground">{subtitle}</p>
        </Reveal>

        <Reveal delay={200}>
          <form onSubmit={submit} className="mt-12 space-y-5 text-left">
            {fields.map((f) => (
              <div key={f.name}>
                <label className="text-[9px] tracking-luxe text-muted-foreground">{f.label}</label>
                <input
                  type={f.type ?? "text"}
                  value={data[f.name]}
                  onChange={(e) => setData({ ...data, [f.name]: e.target.value })}
                  className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm font-light text-offwhite outline-none transition-colors focus:border-gold"
                  required
                />
              </div>
            ))}

            <div>
              <label className="text-[9px] tracking-luxe text-muted-foreground">COMO CONHECEU</label>
              <select
                value={data.como_conheceu}
                onChange={(e) => setData({ ...data, como_conheceu: e.target.value })}
                required
                className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm font-light text-offwhite outline-none transition-colors focus:border-gold"
              >
                <option value="" disabled className="bg-background">
                  Selecione
                </option>
                {ORIGENS.map((o) => (
                  <option key={o} value={o} className="bg-background">
                    {o}
                  </option>
                ))}
              </select>
            </div>

            {err && <p className="text-xs text-destructive">{err}</p>}
            {sent && (
              <p className="text-xs text-gold">
                Recebido! Estamos te redirecionando ao WhatsApp para confirmar o melhor horário.
              </p>
            )}
            <div className="pt-6 text-center">
              <button type="submit" disabled={busy} className="btn-luxe disabled:opacity-50">
                {busy ? "Enviando..." : ctaLabel}
              </button>
            </div>
          </form>

          <div className="mt-12 border-t border-border/50 pt-8">
            <div className="text-[10px] tracking-luxe text-gold">{contactName}</div>
            <a
              href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-light text-offwhite/80 transition-colors hover:text-gold"
            >
              {contactPhone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
