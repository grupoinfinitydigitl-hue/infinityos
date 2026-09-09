import { createFileRoute } from "@tanstack/react-router";
import { DollarSign } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/gestao/financeiro")({
  component: FinanceiroPage,
});

function FinanceiroPage() {
  return (
    <ModuleShell
      title="Gestão Financeira"
      subtitle="Faturamento cirúrgico, orçamentos clínicos, conciliação e repasses médicos"
      icon={DollarSign}
      databaseTable="appointments"
      quickActionLabel="Ver Resumo no Dashboard"
      quickActionHref="/dashboard"
      plannedFeatures={[
        "Emissão de propostas e orçamentos detalhados de procedimentos",
        "Controle de pagamentos em cartão, PIX e parcelamento clínico",
        "Cálculo automático de repasse para a equipe cirúrgica",
        "Fluxo de caixa diário e conciliação bancária",
      ]}
    />
  );
}
