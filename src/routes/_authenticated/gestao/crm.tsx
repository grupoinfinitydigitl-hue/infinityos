import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/gestao/crm")({
  component: CRMPage,
});

function CRMPage() {
  return (
    <ModuleShell
      title="CRM & Relacionamento Clínico"
      subtitle="Funil de solicitações de avaliação da Técnica 4K, retornos e jornada do paciente"
      icon={TrendingUp}
      databaseTable="solicitacoes"
      quickActionLabel="Ver Leads do Site"
      quickActionHref="/painel"
      plannedFeatures={[
        "Funil de leads integrado com solicitações de avaliação do site",
        "Disparo de lembretes humanizados de retorno via WhatsApp",
        "Controle de pós-atendimento e índice de satisfação (NPS)",
        "Histórico unificado da comunicação de cada paciente",
      ]}
    />
  );
}
