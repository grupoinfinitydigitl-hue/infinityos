import { createFileRoute } from "@tanstack/react-router";
import { Bed } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/operacao/recuperacao")({
  component: RecuperacaoPage,
});

function RecuperacaoPage() {
  return (
    <ModuleShell
      title="Recuperação Pós-Procedimento"
      subtitle="Controle de leitos de recuperação, sinais vitais pós-anestésicos e alta assistida"
      icon={Bed}
      databaseTable="rooms"
      quickActionLabel="Ver Pacientes em Recuperação"
      quickActionHref="/pacientes"
      plannedFeatures={[
        "Monitorização de sinais vitais de 15 em 15 minutos",
        "Escala de Aldrete e Kroulik para liberação de alta",
        "Orientações pós-operatórias entregues digitalmente ao paciente",
        "Agendamento automático de retorno de enfermagem e fisioterapia",
      ]}
    />
  );
}
