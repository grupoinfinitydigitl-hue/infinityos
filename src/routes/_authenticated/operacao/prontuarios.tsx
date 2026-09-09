import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FileText, ChevronRight, Stethoscope, HeartPulse } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DEMO_MEDICAL_NOTES, DEMO_PATIENTS } from "@/services/mock-data";

export const Route = createFileRoute("/_authenticated/operacao/prontuarios")({
  component: ProntuariosIndexPage,
});

function ProntuariosIndexPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prontuários Clínicos"
        subtitle="Visão consolidada das evoluções médicas recentes e histórico de pacientes"
      >
        <Link
          to="/pacientes"
          className="rounded-lg bg-primary px-4 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
        >
          Pesquisar Paciente
        </Link>
      </PageHeader>

      <div className="space-y-4">
        <h3 className="font-heading text-base font-semibold text-foreground">
          Evoluções Registradas Recentemente
        </h3>

        <div className="space-y-3">
          {DEMO_MEDICAL_NOTES.map((nota) => {
            const paciente = DEMO_PATIENTS.find((p) => p.id === nota.patientId);
            return (
              <div
                key={nota.id}
                onClick={() => navigate({ to: `/pacientes/${nota.patientId}` })}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 cursor-pointer shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground text-sm">
                      {paciente?.fullName || "Paciente"}
                    </span>
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground uppercase">
                      {nota.noteType}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground">{nota.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{nota.content}</p>
                  <div className="flex items-center gap-2 text-[0.7rem] text-muted-foreground pt-1">
                    <span>{nota.professionalName}</span>
                    <span>•</span>
                    <time>
                      {new Date(nota.noteDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </time>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0">
                  <span>Acessar Prontuário</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
