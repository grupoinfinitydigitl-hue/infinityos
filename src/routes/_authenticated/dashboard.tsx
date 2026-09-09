import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  Sparkles,
  Activity,
  AlertCircle,
  DollarSign,
  Plus,
  ArrowUpRight,
  Clock,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { getDashboardData } from "@/services/clinical-service";
import type { DashboardOverview } from "@/types/infinity";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Infinity OS" },
      { name: "description", content: "Painel operacional do Grupo Infinity" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    setCarregando(true);
    setErro(false);
    try {
      const res = await getDashboardData();
      setData(res);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  if (carregando) {
    return <LoadingState message="Carregando indicadores operacionais…" />;
  }

  if (erro || !data) {
    return <ErrorState title="Não foi possível carregar o dashboard" onRetry={carregarDashboard} />;
  }

  const formatHora = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoDate;
    }
  };

  return (
    <div className="space-y-8">
      {/* CABEÇALHO OPERACIONAL */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Bom dia, Dra. Rhauana.
          </h1>
          <p className="mt-1 text-xs md:text-sm text-muted-foreground">
            Aqui está o resumo da operação de hoje no Grupo Infinity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/agenda"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-surface-muted transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Ver Agenda</span>
          </Link>
          <Link
            to="/pacientes"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Novo Paciente</span>
          </Link>
        </div>
      </div>

      {/* CARDS DE INDICADORES PRINCIPAIS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Pacientes hoje"
          value={data.patientsTodayCount}
          subtitle="4 atendimentos"
          icon={Users}
          trend={{ value: "+1 agendado", isPositive: true }}
        />
        <StatCard
          title="Consultas"
          value={data.appointmentsTodayCount}
          subtitle="Dia corrente"
          icon={Calendar}
        />
        <StatCard
          title="Procedimentos"
          value={data.proceduresMonthCount}
          subtitle="Mês em curso"
          icon={Sparkles}
          trend={{ value: "+12% vs mês ant.", isPositive: true }}
        />
        <StatCard
          title="Cirurgias"
          value={data.surgeriesMonthCount}
          subtitle="Centro Cirúrgico"
          icon={Activity}
        />
        <StatCard
          title="Pendências"
          value={data.pendingIssuesCount}
          subtitle="Requer ação"
          icon={AlertCircle}
          trend={{ value: "Alta prioridade", isNeutral: false }}
        />
        <StatCard
          title="Faturamento mês"
          value={data.monthlyRevenueFormatted}
          subtitle="Consolidado"
          icon={DollarSign}
        />
      </div>

      {/* GRADE OPERACIONAL: AGENDA DE HOJE & PENDÊNCIAS */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* AGENDA DE HOJE (2 Colunas no Desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base md:text-lg font-semibold text-foreground">
                Agenda de hoje
              </h2>
              <p className="text-xs text-muted-foreground">
                Atendimentos, avaliações e procedimentos escalados para hoje
              </p>
            </div>
            <Link
              to="/agenda"
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <span>Agenda completa</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface-muted/50 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="py-3 px-4">Horário</th>
                    <th className="py-3 px-4">Paciente</th>
                    <th className="py-3 px-4">Tipo de Atendimento</th>
                    <th className="py-3 px-4">Profissional</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.todayAppointments.map((app) => (
                    <tr
                      key={app.id}
                      onClick={() => navigate({ to: `/pacientes/${app.patientId}` })}
                      className="cursor-pointer transition-colors hover:bg-surface-muted/40"
                    >
                      <td className="py-3.5 px-4 font-mono font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span>{formatHora(app.startTime)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-foreground whitespace-nowrap">
                        {app.patientName}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {app.appointmentTypeName}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                        {app.professionalName}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <StatusBadge status={app.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PENDÊNCIAS OPERACIONAIS (1 Coluna no Desktop) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base md:text-lg font-semibold text-foreground">
                Pendências
              </h2>
              <p className="text-xs text-muted-foreground">Itens com prazo ou aguardando retorno</p>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[0.68rem] font-semibold text-amber-700 dark:text-amber-300">
              {data.pendingItems.length} ativas
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
            {data.pendingItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-lg border border-border/60 bg-surface p-3 transition-colors hover:border-primary/30"
              >
                <div className="mt-0.5">
                  <AlertCircle
                    className={`h-4 w-4 ${
                      item.severity === "HIGH"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground truncate">{item.title}</p>
                    <span className="text-[0.62rem] text-muted-foreground whitespace-nowrap">
                      {item.date}
                    </span>
                  </div>
                  <p className="mt-1 text-[0.72rem] text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SEÇÃO: ATIVIDADE RECENTE & AUDITORIA */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base md:text-lg font-semibold text-foreground">
              Atividade recente
            </h2>
            <p className="text-xs text-muted-foreground">
              Eventos clínicos e operacionais registrados com auditoria de segurança
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="space-y-3">
            {data.recentActivity.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-4 py-2 border-b border-border/60 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-muted text-muted-foreground font-mono text-[0.65rem] uppercase">
                    {log.action.slice(0, 3)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-foreground">{log.description}</p>
                    <p className="text-[0.68rem] text-muted-foreground">
                      {log.userName || "Sistema"} · {log.entityType}
                    </p>
                  </div>
                </div>
                <time className="text-[0.7rem] text-muted-foreground whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
