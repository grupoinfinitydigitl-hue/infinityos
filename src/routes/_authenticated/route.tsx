import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // Se estiver rodando no servidor (SSR), não bloqueia porque o token de sessão reside no localStorage do navegador
    if (typeof window === "undefined") {
      return {};
    }

    // Validação estrita de autenticação via Supabase no cliente
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        throw redirect({ to: "/login" });
      }

      const user = data.session.user;

      // Validação de perfil ativo
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, role_id, is_active")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.is_active === false) {
        await supabase.auth.signOut();
        throw redirect({ to: "/login" });
      }

      // Validação se o e-mail consta na lista de credenciados
      if (user.email) {
        const { data: accredited } = await supabase
          .from("accredited_emails")
          .select("email, is_active")
          .eq("email", user.email.toLowerCase())
          .maybeSingle();

        if (accredited && accredited.is_active === false) {
          await supabase.auth.signOut();
          throw redirect({ to: "/login" });
        }
      }

      return { user, profile };
    } catch (err) {
      if (err && typeof err === "object" && "to" in err) {
        throw err;
      }
      throw redirect({ to: "/login" });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
