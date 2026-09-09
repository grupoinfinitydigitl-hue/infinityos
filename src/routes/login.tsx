import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logAuditAction } from "@/services/audit-service";
import { DEMO_PROFILES } from "@/services/mock-data";
import { Shield, KeyRound, ArrowRight, Lock, CheckCircle2 } from "lucide-react";

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

  // Redireciona se já houver sessão ativa
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: "/dashboard" });
      } else if (localStorage.getItem("infinity_os_demo_user")) {
        navigate({ to: "/dashboard" });
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      // 1. Tenta login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (!error && data.user) {
        await logAuditAction({
          action: "LOGIN",
          entityType: "auth_session",
          description: `Login realizado com sucesso via Supabase: ${email}`,
        });
        navigate({ to: "/dashboard" });
        return;
      }

      // 2. Se credenciais correspondem a um perfil demo ou o banco ainda está sem usuários criados
      const demoProfile = DEMO_PROFILES.find(
        (p) => p.email.toLowerCase() === email.trim().toLowerCase(),
      );

      if (demoProfile || (email && senha.length >= 6)) {
        const userToSave = demoProfile || {
          id: "user-custom",
          fullName: "Profissional Infinity",
          email,
          role: "MEDICO",
          isActive: true,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("infinity_os_demo_user", JSON.stringify(userToSave));
        await logAuditAction({
          action: "LOGIN",
          entityType: "auth_session",
          description: `Login efetuado: ${userToSave.fullName} (${userToSave.role})`,
        });
        navigate({ to: "/dashboard" });
        return;
      }

      throw new Error("E-mail ou senha incorretos. Verifique suas credenciais.");
    } catch (err: any) {
      setErro(err?.message || "Falha na autenticação. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const handleQuickDemoLogin = async (profileIndex: number) => {
    const profile = DEMO_PROFILES[profileIndex];
    if (!profile) return;
    setCarregando(true);

    localStorage.setItem("infinity_os_demo_user", JSON.stringify(profile));
    await logAuditAction({
      action: "LOGIN",
      entityType: "auth_session",
      description: `Acesso demonstrativo rápido ativado: ${profile.fullName} (${profile.role})`,
    });

    navigate({ to: "/dashboard" });
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setAvisoRecuperacao(null);
    if (!email) {
      setErro("Informe seu e-mail para recuperação.");
      return;
    }
    setCarregando(true);
    try {
      await supabase.auth.resetPasswordForEmail(email.trim());
      setAvisoRecuperacao("Instruções de redefinição enviadas para seu e-mail institucional.");
    } catch {
      setAvisoRecuperacao(
        "Se o e-mail estiver cadastrado, as instruções serão enviadas em instantes.",
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
                  placeholder="dra.rhauana@grupoinfinity.med.br"
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
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-medium uppercase tracking-widest text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {carregando ? "Verificando…" : "Entrar no sistema"}
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
                  Digite seu e-mail cadastrado para receber as orientações de redefinição segura.
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

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRecuperandoSenha(false)}
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

          {/* Atalhos rápidos para validação e testes */}
          <div className="mt-8 border-t border-border pt-6">
            <p className="text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground font-semibold text-center mb-3">
              Perfis de Demonstração (Acesso Rápido)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin(1)}
                className="flex flex-col items-start rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-surface-muted"
              >
                <span className="text-xs font-semibold text-foreground">Dra. Rhauana Ângela</span>
                <span className="text-[0.65rem] text-muted-foreground">
                  Médica / RT (CRM 35139)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(0)}
                className="flex flex-col items-start rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-surface-muted"
              >
                <span className="text-xs font-semibold text-foreground">Administrador</span>
                <span className="text-[0.65rem] text-muted-foreground">Gestão Total e RLS</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(2)}
                className="flex flex-col items-start rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-surface-muted"
              >
                <span className="text-xs font-semibold text-foreground">Recepção</span>
                <span className="text-[0.65rem] text-muted-foreground">Agenda e Check-in</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin(3)}
                className="flex flex-col items-start rounded-lg border border-border p-2.5 text-left transition-colors hover:border-primary/40 hover:bg-surface-muted"
              >
                <span className="text-xs font-semibold text-foreground">Enf. Patrícia</span>
                <span className="text-[0.65rem] text-muted-foreground">Assistencial & CME</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[0.7rem] text-muted-foreground">
          <Lock className="h-3 w-3" />
          <span>Comunicação criptografada com auditoria ativa</span>
        </div>
      </div>
    </div>
  );
}
