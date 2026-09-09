import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui/page-header";
import { DEMO_PROFESSIONALS } from "@/services/mock-data";
import { UserCheck, Shield, Phone, Mail, Award } from "lucide-react";
import { formatPhone } from "@/services/clinical-service";

export const Route = createFileRoute("/_authenticated/gestao/equipe")({
  component: EquipePage,
});

function EquipePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipe Multidisciplinar"
        subtitle="Médicos, cirurgiões, enfermeiros, fisioterapeutas e corpo assistencial"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEMO_PROFESSIONALS.map((prof) => (
          <div
            key={prof.id}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[0.68rem] font-bold text-primary font-mono">
                  {prof.councilType}/{prof.councilState} {prof.councilNumber}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Ativo no sistema" />
              </div>

              <h3 className="mt-3 font-heading text-base font-semibold text-foreground">
                {prof.fullName}
              </h3>

              <div className="mt-2 flex flex-wrap gap-1">
                {prof.specialties.map((spec) => (
                  <span
                    key={spec}
                    className="rounded bg-surface-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>

              <div className="mt-4 space-y-1 text-xs text-muted-foreground border-t border-border/60 pt-3">
                <p className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  <span>{formatPhone(prof.phone)}</span>
                </p>
                {prof.email && (
                  <p className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3" />
                    <span>{prof.email}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
              <span className="text-[0.7rem] text-muted-foreground">Perfil RBAC Ativo</span>
              <span className="font-semibold text-foreground text-[0.7rem]">Acesso Clínico</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
