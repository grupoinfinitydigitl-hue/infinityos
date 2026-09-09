import { createFileRoute } from "@tanstack/react-router";
import { FolderLock } from "lucide-react";
import { ModuleShell } from "@/components/layout/module-shell";

export const Route = createFileRoute("/_authenticated/gestao/documentos")({
  component: DocumentosPage,
});

function DocumentosPage() {
  return (
    <ModuleShell
      title="Repositório de Documentos Clínicos & Modelos"
      subtitle="Modelos institucionais de termos, consentimentos esclarecidos, laudos e atestados"
      icon={FolderLock}
      databaseTable="patient_documents"
      quickActionLabel="Ver Prontuários"
      quickActionHref="/operacao/prontuarios"
      plannedFeatures={[
        "Modelos parametrizados com preenchimento automático do paciente",
        "Assinatura digital padrão ICP-Brasil e aceite eletrônico",
        "Criptografia de ponta a ponta e auditoria de visualização (LGPD)",
        "Classificação por especialidade médica e procedimento",
      ]}
    />
  );
}
