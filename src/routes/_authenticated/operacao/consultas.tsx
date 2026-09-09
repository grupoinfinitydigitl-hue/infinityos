import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/operacao/consultas")({
  component: ConsultasPage,
});

function ConsultasPage() {
  return (
    <ModuleShell
      title="Consultas e Atendimentos"
      subtitle="Fila de atendimento diário, chamadas de consultório e triagem clínica"
      icon={Stethoscope}
      databaseTable="appointments"
      quickActionLabel="Abrir Agenda de Hoje"
      quickActionHref="/agenda"
      plannedFeatures={[
        "Chamada eletrônica de pacientes para o consultório",
        "Cronômetro de tempo de atendimento em sala",
        "Triagem de enfermagem integrada pré-consulta",
        "Prescrição digital de receitas e atestados com QR Code",
      ]}
    />
  );
}
