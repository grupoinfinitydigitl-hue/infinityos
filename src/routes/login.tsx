import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAuditAction } from "@/services/audit-service";
import { ArrowRight, Lock, ShieldCheck, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso Seguro — Infinity OS" },
      { name: "description", content: "Sistema Integrado de Gestão Clínica do Grupo Infinity." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [recuperandoSenha, setRecuperandoSenha] = useState(false);
  const [avisoRecuperacao, setAvisoRecuperacao] = useState<string | null>(null);

  // Redireciona se já houver sessão autenticada ativa no Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard" });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      // 1. Autenticação estrita contra o Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error || !data.user) {
        throw new Error(
          "E-mail ou senha incorretos. Apenas profissionais e colaboradores credenciados possuem acesso.",
        );
      }

      // 2. Validação de perfil cadastrado e ativo
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, role_id, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        throw new Error("Acesso suspenso. Seu cadastro está inativo. Procure a Administração.");
      }

      await logAuditAction({
        action: "LOGIN",
        entityType: "auth_session",
        description: `Login seguro efetuado: ${profile?.full_name || email} (${profile?.role_id || "CRED"})`,
      });

      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setErro(err?.message || "Falha na autenticação. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvisoRecuperacao(null);
    if (!email) {
      setErro("Informe seu e-mail institucional para recuperação.");
      return;
    }
    setCarregando(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
      setAvisoRecuperacao(
        "Se o e-mail estiver credenciado, as instruções de redefinição serão enviadas.",
      );
    } catch {
      setAvisoRecuperacao(
        "Se o e-mail estiver credenciado, as instruções de redefinição serão enviadas.",
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-surface-muted/60 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center">
          <img
            src="/images/infinity-os-logo.png"
            alt="Infinity OS — Sistema Integrado de Gestão Clínica"
            className="h-24 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
          />
        </div>
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
          Sistema Integrado de Gestão Clínica
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
          {!recuperandoSenha ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  E-mail institucional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@grupoinfinity.med.br"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Senha
                  </label>
                  <button
                    type="button"
                    onClick={() => setRecuperandoSenha(true)}
                    className="text-[0.7rem] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Esqueci a senha
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {erro && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{erro}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {carregando ? "Autenticando…" : "Entrar no sistema"}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <div className="text-left">
                <h3 className="font-heading text-base font-semibold text-foreground">
                  Recuperação de Acesso
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Digite seu e-mail cadastrado no sistema para receber as instruções de recuperação.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  E-mail institucional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@grupoinfinity.med.br"
                  className="mt-1.5 h-10 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {avisoRecuperacao && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {avisoRecuperacao}
                </div>
              )}

              {erro && (
                <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{erro}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecuperandoSenha(false);
                    setErro(null);
                  }}
                  className="h-10 flex-1 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="h-10 flex-1 rounded-lg bg-primary px-3 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {carregando ? "Enviando…" : "Redefinir"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-border pt-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[0.7rem] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span>Acesso restrito ao corpo clínico e equipe autorizada</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Autenticação criptografada com controle de acesso RBAC</span>
        </div>
      </div>
    </div>
  );
}
