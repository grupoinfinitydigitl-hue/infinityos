import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/operacao/cme")({
  component: CMEPage,
});

function CMEPage() {
  return (
    <ModuleShell
      title="CME — Central de Material e Esterilização"
      subtitle="Rastreabilidade de caixas cirúrgicas, ciclos de autoclave e testes biológicos"
      icon={Layers}
      databaseTable="audit_logs"
      quickActionLabel="Painel de Biossegurança"
      quickActionHref="/dashboard"
      plannedFeatures={[
        "Rastreabilidade de kits de cânulas da Técnica 4K por QR Code",
        "Registro de ciclos de esterilização física, química e biológica",
        "Alerta de validade de pacotes estéreis",
        "Conferência digital de kits antes da entrada no centro cirúrgico",
      ]}
    />
  );
}
