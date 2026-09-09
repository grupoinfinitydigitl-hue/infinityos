import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  getAppointments,
  getPatients,
  createAppointment,
  updateAppointmentStatus,
  formatPhone,
  calculateAge,
} from "@/services/clinical-service";
import { DEMO_PROFESSIONALS, DEMO_ROOMS, DEMO_APPOINTMENT_TYPES } from "@/services/mock-data";
import type { Appointment, AppointmentStatus, Patient } from "@/types/infinity";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda Clínica — Infinity OS" },
      {
        name: "description",
        content: "Controle de consultas, avaliações e procedimentos do Grupo Infinity",
      },
    ],
  }),
  component: AgendaPage,
});

type Visualizacao = "DIA" | "SEMANA" | "MES";

function AgendaPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [visualizacao, setVisualizacao] = useState<Visualizacao>("DIA");
  const [filtroProfissional, setFiltroProfissional] = useState<string>("TODOS");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  // Modal Novo Agendamento
  const [modalAberto, setModalAberto] = useState(false);
  const [pacienteSelecionadoId, setPacienteSelecionadoId] = useState("");
  const [pacienteSelecionadoObj, setPacienteSelecionadoObj] = useState<Patient | null>(null);
  const [profissionalId, setProfissionalId] = useState(DEMO_PROFESSIONALS[0]?.id || "");
  const [roomId, setRoomId] = useState(DEMO_ROOMS[0]?.id || "");
  const [appointmentTypeId, setAppointmentTypeId] = useState(DEMO_APPOINTMENT_TYPES[0]?.id || "");
  const [dataHora, setDataHora] = useState("2026-09-09T11:00");
  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(false);
    try {
      const [apps, pacs] = await Promise.all([getAppointments(), getPatients()]);
      setAppointments(apps);
      setPacientes(pacs);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // Atualiza objeto do paciente selecionado para preenchimento automático
  useEffect(() => {
    if (pacienteSelecionadoId) {
      const p = pacientes.find((item) => item.id === pacienteSelecionadoId) || null;
      setPacienteSelecionadoObj(p);
    } else {
      setPacienteSelecionadoObj(null);
    }
  }, [pacienteSelecionadoId, pacientes]);

  const handleCriarAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteSelecionadoId || !dataHora) {
      setFormErro("Selecione o paciente e o horário do agendamento.");
      return;
    }

    setSalvando(true);
    setFormErro(null);

    try {
      const start = new Date(dataHora);
      const end = new Date(start.getTime() + 45 * 60000);

      const novo = await createAppointment({
        patientId: pacienteSelecionadoId,
        professionalId,
        roomId,
        appointmentTypeId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        notes: observacoes,
      });

      setAppointments([...appointments, novo]);
      setModalAberto(false);
      setPacienteSelecionadoId("");
      setObservacoes("");
    } catch (err: any) {
      setFormErro(err?.message || "Erro ao agendar consulta.");
    } finally {
      setSalvando(false);
    }
  };

  const handleMudarStatus = async (appId: string, novoStatus: AppointmentStatus) => {
    await updateAppointmentStatus(appId, novoStatus);
    setAppointments((prev) => prev.map((a) => (a.id === appId ? { ...a, status: novoStatus } : a)));
  };

  const appointmentsFiltrados = appointments.filter((a) => {
    if (filtroProfissional !== "TODOS" && a.professionalId !== filtroProfissional) {
      return false;
    }
    return true;
  });

  const formatHora = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Agenda Clínica"
        subtitle="Quadro geral de atendimentos, consultas médicas e procedimentos cirúrgicos"
      >
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Novo Agendamento</span>
        </button>
      </PageHeader>

      {/* CONTROLES DA AGENDA: MODO VISUAL E PROFISSIONAIS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
        {/* Alternância de Visão */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          {(["DIA", "SEMANA", "MES"] as Visualizacao[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVisualizacao(v)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                visualizacao === v
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "DIA" ? "Visão do Dia" : v === "SEMANA" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>

        {/* Data Corrente e Navegação */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-surface-muted text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded border border-border hover:bg-surface-muted text-muted-foreground hover:text-foreground">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <span className="font-heading text-sm font-semibold text-foreground">
            Quarta-feira, 09 de Setembro de 2026
          </span>
        </div>

        {/* Filtro por Profissional */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <select
            value={filtroProfissional}
            onChange={(e) => setFiltroProfissional(e.target.value)}
            className="h-8 rounded-lg border border-border bg-surface px-2.5 text-xs outline-none"
          >
            <option value="TODOS">Todos os Profissionais</option>
            {DEMO_PROFESSIONALS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GRADE DA AGENDA */}
      {carregando ? (
        <LoadingState message="Carregando horários da agenda…" />
      ) : erro ? (
        <ErrorState onRetry={carregar} />
      ) : (
        <div className="space-y-3">
          {appointmentsFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-xs text-muted-foreground">
              Nenhum agendamento encontrado para a data e filtros selecionados.
            </div>
          ) : (
            appointmentsFiltrados.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-card p-4 transition-all duration-150 hover:border-primary/40 hover:shadow-xs"
              >
                {/* HORÁRIO & PACIENTE */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-surface-muted px-3 py-2 text-center min-w-[72px]">
                    <span className="font-mono text-sm font-bold text-foreground">
                      {formatHora(app.startTime)}
                    </span>
                    <span className="text-[0.62rem] text-muted-foreground">
                      {formatHora(app.endTime)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate({ to: `/pacientes/${app.patientId}` })}
                        className="font-heading text-sm font-semibold text-foreground hover:underline text-left"
                      >
                        {app.patientName}
                      </button>
                      <StatusBadge status={app.status} />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {app.appointmentTypeName} · {app.professionalName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[0.7rem] text-muted-foreground pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {app.roomName || "Consultório Principal"}
                      </span>
                      {app.patientPhone && <span>· {formatPhone(app.patientPhone)}</span>}
                    </div>
                  </div>
                </div>

                {/* AÇÕES RÁPIDAS DE ATENDIMENTO */}
                <div className="flex flex-wrap items-center gap-2 sm:justify-end border-t border-border sm:border-t-0 pt-2 sm:pt-0">
                  {app.status === "SCHEDULED" && (
                    <button
                      type="button"
                      onClick={() => handleMudarStatus(app.id, "CONFIRMED")}
                      className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[0.7rem] font-medium text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                    >
                      Confirmar
                    </button>
                  )}

                  {app.status === "CONFIRMED" && (
                    <button
                      type="button"
                      onClick={() => handleMudarStatus(app.id, "IN_PROGRESS")}
                      className="rounded-md border border-amber-300 bg-amber-50 px-2.5 py-1 text-[0.7rem] font-medium text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
                    >
                      Iniciar Atendimento
                    </button>
                  )}

                  {app.status === "IN_PROGRESS" && (
                    <button
                      type="button"
                      onClick={() => handleMudarStatus(app.id, "COMPLETED")}
                      className="rounded-md bg-primary px-2.5 py-1 text-[0.7rem] font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Finalizar
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate({ to: `/pacientes/${app.patientId}` })}
                    className="rounded-md border border-border px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Ver Prontuário
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: NOVO AGENDAMENTO COM REUTILIZAÇÃO INTELIGENTE DE DADOS */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Novo Agendamento Clínico
                </h3>
                <p className="text-xs text-muted-foreground">
                  Princípio: reutilização automática de dados já cadastrados
                </p>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCriarAgendamento} className="mt-6 space-y-4 text-left">
              {formErro && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  {formErro}
                </div>
              )}

              {/* SELEÇÃO DO PACIENTE */}
              <div>
                <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Paciente Cadastrado *
                </label>
                <select
                  required
                  value={pacienteSelecionadoId}
                  onChange={(e) => setPacienteSelecionadoId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecione o paciente…</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} — {formatPhone(p.phone)}
                    </option>
                  ))}
                </select>
              </div>

              {/* CARD DE DADOS AUTOMATICAMENTE RECUPERADOS */}
              {pacienteSelecionadoObj && (
                <div className="rounded-xl border border-border/80 bg-surface-muted/60 p-3.5 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>{pacienteSelecionadoObj.fullName}</span>
                    <StatusBadge status={pacienteSelecionadoObj.status} />
                  </div>
                  <p className="text-muted-foreground text-[0.72rem]">
                    {calculateAge(pacienteSelecionadoObj.birthDate)} anos · Tel:{" "}
                    {formatPhone(pacienteSelecionadoObj.phone)}
                  </p>
                  {pacienteSelecionadoObj.clinicalSummary && (
                    <p className="text-muted-foreground text-[0.7rem] line-clamp-1 italic">
                      Obs: {pacienteSelecionadoObj.clinicalSummary}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Profissional *
                  </label>
                  <select
                    value={profissionalId}
                    onChange={(e) => setProfissionalId(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {DEMO_PROFESSIONALS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.councilType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tipo de Atendimento *
                  </label>
                  <select
                    value={appointmentTypeId}
                    onChange={(e) => setAppointmentTypeId(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {DEMO_APPOINTMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.durationMinutes} min)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sala ou Leito
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {DEMO_ROOMS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Data e Horário *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={dataHora}
                    onChange={(e) => setDataHora(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Notas de Agendamento
                </label>
                <textarea
                  rows={2}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Instruções para o atendimento ou preparo prévio…"
                  className="mt-1 w-full rounded-lg border border-border bg-surface p-2.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {salvando ? "Agendando…" : "Confirmar Agendamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
