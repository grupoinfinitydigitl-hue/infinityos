import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/gestao/estoque")({
  component: EstoquePage,
});

function EstoquePage() {
  return (
    <ModuleShell
      title="Controle de Estoque & Farmácia"
      subtitle="Insumos cirúrgicos, fios de sustentação, anestésicos, toxinas e ponto de pedido"
      icon={Package}
      databaseTable="rooms"
      quickActionLabel="Painel de Cirurgias"
      quickActionHref="/operacao/centro-cirurgico"
      plannedFeatures={[
        "Baixa automática de materiais ao registrar procedimento no prontuário",
        "Controle de lote, validade e rastreabilidade Anvisa",
        "Ponto de pedido com alerta de estoque mínimo",
        "Inventário periódico com leitor de código de barras",
      ]}
    />
  );
}
