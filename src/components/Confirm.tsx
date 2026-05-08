import { useState } from "react";
import { Reveal } from "./Reveal";
import { z } from "zod";

const WHATSAPP = "5547988178508"; // Shirlei Lissoni

const schema = z.object({
  nome: z.string().trim().min(2, "Informe seu nome").max(100),
  telefone: z.string().trim().min(8, "Telefone inválido").max(20),
  email: z.string().trim().email("E-mail inválido").max(120),
});

export function Confirm() {
  const [data, setData] = useState({ nome: "", telefone: "", email: "" });
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(data);
    if (!r.success) {
      setErr(r.error.issues[0]?.message ?? "Verifique os campos");
      return;
    }
    setErr(null);
    const msg = `Olá! Gostaria de confirmar minha presença na Experiência Wolfegarten.%0A%0ANome: ${encodeURIComponent(r.data.nome)}%0ATelefone: ${encodeURIComponent(r.data.telefone)}%0AE-mail: ${encodeURIComponent(r.data.email)}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  };

  return (
    <section id="confirmar" className="bg-forest-deep py-32 md:py-44">
      <div className="mx-auto max-w-xl px-6 text-center">
        <Reveal>
          <div className="text-[10px] tracking-luxe text-gold">CONFIRMAÇÃO</div>
          <div className="mx-auto my-6 gold-divider" />
          <h2 className="font-serif text-3xl font-light text-offwhite md:text-5xl">
            Confirmar Presença
          </h2>
          <p className="mt-6 text-sm font-light text-muted-foreground">
            Reserve seu lugar neste encontro exclusivo.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <form onSubmit={submit} className="mt-12 space-y-5 text-left">
            {(["nome", "telefone", "email"] as const).map((f) => (
              <div key={f}>
                <label className="text-[9px] tracking-luxe text-muted-foreground">
                  {f === "nome" ? "NOME" : f === "telefone" ? "TELEFONE" : "E-MAIL"}
                </label>
                <input
                  type={f === "email" ? "email" : "text"}
                  value={data[f]}
                  onChange={(e) => setData({ ...data, [f]: e.target.value })}
                  className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm font-light text-offwhite outline-none transition-colors focus:border-gold"
                  required
                />
              </div>
            ))}
            {err && <p className="text-xs text-destructive">{err}</p>}
            <div className="pt-6 text-center">
              <button type="submit" className="btn-luxe">
                Confirmar via WhatsApp
              </button>
            </div>
          </form>

          <div className="mt-12 border-t border-border/50 pt-8">
            <div className="text-[10px] tracking-luxe text-gold">SHIRLEI LISSONI</div>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-light text-offwhite/80 transition-colors hover:text-gold"
            >
              (47) 98817-8508
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
