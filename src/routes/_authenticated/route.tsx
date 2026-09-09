import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1. Verifica autenticação oficial via Supabase
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        return { user: data.user };
      }
    } catch {
      // Falha silenciosa
    }

    // 2. Verifica sessão demonstrativa local
    if (typeof window !== "undefined") {
      const demoUser = localStorage.getItem("infinity_os_demo_user");
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          return { user: parsed };
        } catch {
          // JSON inválido
        }
      }
    }

    // Se não autenticado por nenhum método, redireciona para o login
    throw redirect({ to: "/login" });
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
