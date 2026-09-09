import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/relatorios")({
  component: RelatoriosPage,
});

function RelatoriosPage() {
  return (
    <ModuleShell
      title="Relatórios & Inteligência Clínica"
      subtitle="Métricas de conversão cirúrgica, taxa de ocupação de salas e evolução biológica"
      icon={BarChart3}
      databaseTable="audit_logs"
      quickActionLabel="Ver Indicadores no Dashboard"
      quickActionHref="/dashboard"
      plannedFeatures={[
        "Relatório de taxa de comparecimento (No-Show) por profissional",
        "Tempo médio de recuperação e permanência no centro cirúrgico",
        "Índice de conversão da avaliação inicial em procedimento realizado",
        "Exportação segura de relatórios em PDF e planilha auditada",
      ]}
    />
  );
}
