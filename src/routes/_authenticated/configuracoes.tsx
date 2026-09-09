import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Shield, Key, Sliders, Database, CheckCircle2 } from "lucide-react";
import { getAuditLogs } from "@/services/audit-service";
import type { AuditLog } from "@/types/infinity";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: ConfiguracoesPage,
});

const ROLES_LIST = [
  {
    id: "ADMINISTRADOR",
    name: "Administrador",
    desc: "Acesso total, gestão de usuários e configurações do sistema.",
  },
  {
    id: "COORDENADOR",
    name: "Coordenador Clínico",
    desc: "Gestão de escalas, auditoria e relatórios operacionais.",
  },
  {
    id: "MEDICO",
    name: "Médico(a)",
    desc: "Acesso completo a prontuários, prescrições e cirurgias.",
  },
  {
    id: "ENFERMAGEM",
    name: "Enfermagem",
    desc: "Evoluções assistenciais, triagem e controle de leitos.",
  },
  {
    id: "FISIOTERAPIA",
    name: "Fisioterapia",
    desc: "Protocolos de pós-operatório e reabilitação tecidual.",
  },
  { id: "RECEPCAO", name: "Recepção", desc: "Cadastro de pacientes, check-in e agendamentos." },
  { id: "FINANCEIRO", name: "Financeiro", desc: "Fluxo de caixa, orçamentos e recebimentos." },
  { id: "ESTOQUE", name: "Estoque & Farmácia", desc: "Controle de insumos, fios e medicações." },
  { id: "CME", name: "CME", desc: "Esterilização e rastreabilidade de caixas cirúrgicas." },
];

function ConfiguracoesPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    getAuditLogs().then(setLogs);
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configurações & Segurança"
        subtitle="Controle de perfis RBAC, auditoria de dados sensíveis e parametrizações clínicas"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* CONTROLE DE ACESSO BASEADO EM FUNÇÕES (RBAC) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Perfis de Acesso (RBAC)
              </h3>
              <p className="text-xs text-muted-foreground">
                9 perfis com controle de permissões por módulo clínico
              </p>
            </div>
          </div>

          <div className="divide-y divide-border border-y border-border">
            {ROLES_LIST.map((role) => (
              <div key={role.id} className="py-2.5 flex items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-foreground text-xs">{role.name}</span>
                  <p className="text-[0.68rem] text-muted-foreground">{role.desc}</p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  Ativo
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* LOGS DE AUDITORIA DE SEGURANÇA */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">
                Trilha de Auditoria (Audit Logs)
              </h3>
              <p className="text-xs text-muted-foreground">
                Registro inviolável de ações sensíveis e acessos a prontuários
              </p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-border border-y border-border">
            {logs.map((l) => (
              <div key={l.id} className="py-2 text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[0.68rem] font-bold text-foreground uppercase">
                    {l.action}
                  </span>
                  <time className="text-[0.65rem] text-muted-foreground">
                    {new Date(l.createdAt).toLocaleTimeString("pt-BR")}
                  </time>
                </div>
                <p className="text-muted-foreground text-[0.72rem]">{l.description}</p>
                <p className="text-[0.65rem] text-muted-foreground/70">
                  {l.userName || "Sistema"} · {l.ipAddress || "187.56.24.110"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
