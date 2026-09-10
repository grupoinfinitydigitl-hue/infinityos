import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingState } from "@/components/ui/loading-state";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (!data?.session?.user) {
          if (isMounted) {
            navigate({ to: "/login" });
          }
          return;
        }

        // Validação de e-mail institucional na lista credenciada
        const userEmail = data.session.user.email?.toLowerCase();
        if (userEmail) {
          const { data: accredited } = await supabase
            .from("accredited_emails")
            .select("is_active")
            .eq("email", userEmail)
            .maybeSingle();

          if (accredited && accredited.is_active === false) {
            await supabase.auth.signOut();
            if (isMounted) {
              navigate({ to: "/login" });
            }
            return;
          }
        }

        if (isMounted) {
          setAuthorized(true);
          setChecking(false);
        }
      } catch (err) {
        console.error("Auth verification error:", err);
        if (isMounted) {
          navigate({ to: "/login" });
        }
      }
    }

    verifyAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        if (isMounted) {
          navigate({ to: "/login" });
        }
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-muted/60">
        <LoadingState message="Validando credenciais do corpo clínico..." />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
