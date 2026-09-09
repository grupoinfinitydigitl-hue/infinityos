import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/operacao/procedimentos")({
  component: ProcedimentosPage,
});

function ProcedimentosPage() {
  return (
    <ModuleShell
      title="Procedimentos & Técnica 4K"
      subtitle="Planejamento anatômico, execução de procedimentos minimamente invasivos e acompanhamento"
      icon={Sparkles}
      databaseTable="procedures"
      quickActionLabel="Ver Pacientes"
      quickActionHref="/pacientes"
      plannedFeatures={[
        "Mapeamento de regiões anatômicas tratadas (abdômen, flancos, papada)",
        "Checklist pré-procedimento com anestesia tumescente",
        "Registro de parâmetros técnicos do laser de diodo",
        "Registro fotográfico padronizado de pré e pós-imediato",
      ]}
    />
  );
}
