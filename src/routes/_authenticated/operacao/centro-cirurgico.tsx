import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/operacao/centro-cirurgico")({
  component: CentroCirurgicoPage,
});

function CentroCirurgicoPage() {
  return (
    <ModuleShell
      title="Centro Cirúrgico Infinity"
      subtitle="Escalas de salas cirúrgicas, controle de equipes multidisciplinares e biossegurança"
      icon={Activity}
      databaseTable="rooms"
      quickActionLabel="Ver Agenda Cirúrgica"
      quickActionHref="/agenda"
      plannedFeatures={[
        "Escala de cirurgiões, anestesistas e instrumentadores",
        "Time-out cirúrgico digital (Cirurgia Segura OMS)",
        "Integração de insumos com a Central de Material (CME)",
        "Monitoramento de tempos cirúrgicos e anestésicos",
      ]}
    />
  );
}
