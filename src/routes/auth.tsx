import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso ao painel — Técnica 4K" },
      {
        name: "description",
        content:
          "Área restrita da equipe Técnica 4K para acompanhar as solicitações de avaliação recebidas pelo site.",
      },
      { property: "og:title", content: "Acesso ao painel — Técnica 4K" },
      {
        property: "og:description",
        content: "Área restrita da equipe Técnica 4K.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel" });
    });
  }, [navigate]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        navigate({ to: "/painel" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { emailRedirectTo: `${window.location.origin}/painel` },
        });
        if (error) throw error;
        setAviso("Conta criada. Se for pedida confirmação, verifique seu e-mail.");
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setCarregando(false);
    }
  }

  async function entrarComGoogle() {
    setErro(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setErro("Não foi possível entrar com o Google.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/painel" });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-6 py-16">
      <div className="w-full max-w-sm border border-border bg-background p-10">
        <p className="eyebrow text-muted-foreground">Área restrita</p>
        <h1 className="heading-display mt-4 text-3xl">Painel de solicitações</h1>

        <form onSubmit={enviar} className="mt-8 space-y-4">
          <Campo label="E-mail">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
            />
          </Campo>
          <Campo label="Senha">
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-champagne"
            />
          </Campo>
          {erro && <p className="text-xs text-destructive">{erro}</p>}
          {aviso && <p className="text-xs text-muted-foreground">{aviso}</p>}
          <button
            type="submit"
            disabled={carregando}
            className="w-full border border-primary px-6 py-3 text-xs uppercase tracking-[0.25em] text-primary transition-colors duration-500 hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
          >
            {carregando ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={entrarComGoogle}
          className="mt-3 w-full border border-border px-6 py-3 text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors duration-500 hover:border-champagne hover:text-foreground"
        >
          Entrar com Google
        </button>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-6 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          {mode === "login" ? "Criar conta de acesso" : "Já tenho conta"}
        </button>

        <div className="mt-6 border-t border-border pt-4 text-center">
          <a href="/login" className="text-xs font-medium text-foreground hover:underline">
            Acessar o Infinity OS (Sistema Integrado) →
          </a>
        </div>
      </div>
    </main>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
