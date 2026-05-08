import { useState } from "react";
import { Reveal } from "./Reveal";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useText } from "@/hooks/use-site-content";

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  telefone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(120),
  cidade: z.string().trim().min(2, "Informe sua cidade").max(80),
  como_conheceu: z.string().trim().min(2, "Selecione uma opção").max(80),
});

const ORIGENS = ["Instagram", "Indicação", "WhatsApp", "Corretor", "Outro"];

export function Confirm() {
  const eyebrow = useText("confirm.eyebrow", "CONFIRMAÇÃO");
  const title = useText("confirm.title", "Confirmar Presença");
  const subtitle = useText("confirm.subtitle", "Reserve seu lugar neste encontro exclusivo.");
  const ctaLabel = useText("confirm.cta", "Confirmar via WhatsApp");
  const contactName = useText("confirm.contact_name", "SHIRLEI LISSONI");
  const contactPhone = useText("confirm.contact_phone_display", "(47) 98817-8508");
  const whatsapp = useText("contact.whatsapp", "5547988178508");

  const [data, setData] = useState({
    nome: "",
    telefone: "",
    email: "",
    cidade: "",
    como_conheceu: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
    const msg =
      `*Nova confirmação — Experiência Wölfegarten*%0A%0A` +
      `*Nome:* ${encodeURIComponent(r.data.nome)}%0A` +
      `*Telefone:* ${encodeURIComponent(r.data.telefone)}%0A` +
      `*E-mail:* ${encodeURIComponent(r.data.email)}%0A` +
      `*Cidade:* ${encodeURIComponent(r.data.cidade)}%0A` +
      `*Como conheceu:* ${encodeURIComponent(r.data.como_conheceu)}`;
    window.open(`https://wa.me/${whatsapp}?text=${msg}`, "_blank");
    setData({ nome: "", telefone: "", email: "", cidade: "", como_conheceu: "" });
  };

  const fields: { name: keyof typeof data; label: string; type?: string }[] = [
    { name: "nome", label: "NOME" },
    { name: "telefone", label: "TELEFONE" },
    { name: "email", label: "E-MAIL", type: "email" },
    { name: "cidade", label: "CIDADE" },
  ];

  return (
    <section id="confirmar" className="bg-forest-deep py-32 md:py-44">
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
            <div className="pt-6 text-center">
              <button type="submit" disabled={busy} className="btn-luxe disabled:opacity-50">
                {busy ? "Enviando..." : ctaLabel}
              </button>
            </div>
          </form>

          <div className="mt-12 border-t border-border/50 pt-8">
            <div className="text-[10px] tracking-luxe text-gold">{contactName}</div>
            <a
              href={`https://wa.me/${whatsapp}`}
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
