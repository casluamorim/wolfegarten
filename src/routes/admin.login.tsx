import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin · Wölfegarten" }, { name: "robots", content: "noindex" }] }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/admin" });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    const { error } = await fn;
    setBusy(false);
    if (error) setErr(error.message);
  };

  const google = async () => {
    setErr(null);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/admin`,
    });
    if (r.error) setErr(r.error.message ?? "Falha no Google");
  };

  if (loading) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <div className="text-[10px] tracking-luxe text-gold">PAINEL ADMINISTRATIVO</div>
          <div className="mx-auto my-6 gold-divider" />
          <h1 className="font-serif text-3xl font-light text-offwhite">WÖLFEGARTEN</h1>
        </div>

        <form onSubmit={submit} className="mt-12 space-y-5">
          <div>
            <label className="text-[9px] tracking-luxe text-muted-foreground">E-MAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm font-light text-offwhite outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-luxe text-muted-foreground">SENHA</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-2 w-full border-b border-border bg-transparent py-3 text-sm font-light text-offwhite outline-none focus:border-gold"
            />
          </div>
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button type="submit" disabled={busy} className="btn-luxe w-full disabled:opacity-50">
            {busy ? "..." : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button onClick={google} className="btn-ghost-luxe mt-4 w-full">
          Continuar com Google
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 w-full text-center text-[10px] tracking-luxe text-muted-foreground hover:text-gold"
        >
          {mode === "login" ? "PRIMEIRO ACESSO? CRIAR CONTA" : "JÁ TENHO CONTA"}
        </button>
      </div>
    </div>
  );
}
