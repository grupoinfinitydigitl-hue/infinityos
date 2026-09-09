import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Plus,
  UserPlus,
  Phone,
  Calendar as CalendarIcon,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import { StatusBadge } from "@/components/ui/status-badge";
import { PatientAvatar } from "@/components/ui/patient-avatar";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  getPatients,
  createPatient,
  formatCPF,
  formatPhone,
  calculateAge,
} from "@/services/clinical-service";
import type { Patient, PatientStatus } from "@/types/infinity";

export const Route = createFileRoute("/_authenticated/pacientes/")({
  head: () => ({
    meta: [
      { title: "Pacientes — Infinity OS" },
      { name: "description", content: "Diretório e prontuários de pacientes do Grupo Infinity" },
    ],
  }),
  component: PacientesListPage,
});

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos os Status" },
  { value: "ACTIVE", label: "Ativos" },
  { value: "IN_TREATMENT", label: "Em Tratamento" },
  { value: "POST_PROCEDURE", label: "Pós-Procedimento" },
  { value: "INACTIVE", label: "Inativos" },
];

function PacientesListPage() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("ALL");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  // Form State para Novo Paciente
  const [novoNome, setNovoNome] = useState("");
  const [novoNomeSocial, setNovoNomeSocial] = useState("");
  const [novoCpf, setNovoCpf] = useState("");
  const [novaDataNasc, setNovaDataNasc] = useState("");
  const [novoGenero, setNovoGenero] = useState<"M" | "F" | "OUTRO">("F");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novoStatus, setNovoStatus] = useState<PatientStatus>("ACTIVE");
  const [novoContatoEmergencia, setNovoContatoEmergencia] = useState("");
  const [novoTelefoneEmergencia, setNovoTelefoneEmergencia] = useState("");
  const [novoResumoClinico, setNovoResumoClinico] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [formErro, setFormErro] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(false);
    try {
      const res = await getPatients(busca, statusFiltro);
      setPacientes(res);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, [busca, statusFiltro]);

  const handleSalvarPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErro(null);

    const cpfLimpo = novoCpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setFormErro("O CPF deve conter exatamente 11 dígitos.");
      return;
    }

    if (!novoNome.trim() || !novoTelefone.trim() || !novaDataNasc) {
      setFormErro("Preencha os campos obrigatórios (Nome, CPF, Data de Nascimento e Telefone).");
      return;
    }

    setSalvando(true);
    try {
      const criado = await createPatient({
        fullName: novoNome,
        socialName: novoNomeSocial,
        cpf: cpfLimpo,
        birthDate: novaDataNasc,
        gender: novoGenero,
        phone: novoTelefone,
        email: novoEmail,
        status: novoStatus,
        emergencyContactName: novoContatoEmergencia,
        emergencyContactPhone: novoTelefoneEmergencia,
        clinicalSummary: novoResumoClinico,
      });

      setModalAberto(false);
      resetForm();
      navigate({ to: `/pacientes/${criado.id}` });
    } catch (err: any) {
      setFormErro(err?.message || "Não foi possível cadastrar o paciente.");
    } finally {
      setSalvando(false);
    }
  };

  const resetForm = () => {
    setNovoNome("");
    setNovoNomeSocial("");
    setNovoCpf("");
    setNovaDataNasc("");
    setNovoGenero("F");
    setNovoTelefone("");
    setNovoEmail("");
    setNovoStatus("ACTIVE");
    setNovoContatoEmergencia("");
    setNovoTelefoneEmergencia("");
    setNovoResumoClinico("");
    setFormErro(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pacientes"
        subtitle="Gerenciamento do diretório de pacientes, dados cadastrais e prontuários médicos"
      >
        <button
          type="button"
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Novo Paciente</span>
        </button>
      </PageHeader>

      {/* BARRA DE FILTROS E PESQUISA */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md w-full">
          <SearchInput
            value={busca}
            onChange={setBusca}
            placeholder="Pesquisar por nome, CPF ou telefone…"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFiltro(opt.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                statusFiltro === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-surface border border-border text-muted-foreground hover:bg-surface-muted"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* LISTA / TABELA DE PACIENTES */}
      {carregando ? (
        <LoadingState message="Carregando pacientes…" />
      ) : erro ? (
        <ErrorState onRetry={carregar} />
      ) : pacientes.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Nenhum paciente encontrado"
          description={
            busca
              ? "Nenhum paciente corresponde aos critérios de busca informados."
              : "Você ainda não possui pacientes cadastrados nesta categoria."
          }
          actionLabel="+ Cadastrar Paciente"
          onAction={() => setModalAberto(true)}
        />
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="py-3.5 px-4">Paciente</th>
                  <th className="py-3.5 px-4">CPF (Protegido)</th>
                  <th className="py-3.5 px-4">Idade</th>
                  <th className="py-3.5 px-4">Telefone</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pacientes.map((p) => {
                  const idade = calculateAge(p.birthDate);
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate({ to: `/pacientes/${p.id}` })}
                      className="cursor-pointer transition-colors hover:bg-surface-muted/40"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <PatientAvatar name={p.fullName} gender={p.gender} />
                          <div>
                            <p className="font-semibold text-foreground">{p.fullName}</p>
                            {p.socialName && (
                              <p className="text-[0.68rem] text-muted-foreground">
                                Nome social: {p.socialName}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-muted-foreground">
                        {formatCPF(p.cpf, true)}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">
                        {idade > 0 ? `${idade} anos` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-muted-foreground">{formatPhone(p.phone)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                          Prontuário
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: NOVO PACIENTE */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Cadastrar Novo Paciente
                </h3>
                <p className="text-xs text-muted-foreground">
                  Preencha os dados de identificação e contato clínico
                </p>
              </div>
              <button
                onClick={() => {
                  setModalAberto(false);
                  resetForm();
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarPaciente} className="mt-6 space-y-4 text-left">
              {formErro && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  {formErro}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Mariana Costa Silveira"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Nome Social (Opcional)
                  </label>
                  <input
                    type="text"
                    value={novoNomeSocial}
                    onChange={(e) => setNovoNomeSocial(e.target.value)}
                    placeholder="Como prefere ser chamado(a)"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    CPF (somente números) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={novoCpf}
                    onChange={(e) => setNovoCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={novaDataNasc}
                    onChange={(e) => setNovaDataNasc(e.target.value)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sexo Biológico *
                  </label>
                  <select
                    value={novoGenero}
                    onChange={(e) => setNovoGenero(e.target.value as any)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="F">Feminino</option>
                    <option value="M">Masculino</option>
                    <option value="OUTRO">Outro / Não especificado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    placeholder="(62) 90000-0000"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(e) => setNovoEmail(e.target.value)}
                    placeholder="paciente@exemplo.com"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status Clínico Inicial
                  </label>
                  <select
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(e.target.value as PatientStatus)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="ACTIVE">Ativo</option>
                    <option value="IN_TREATMENT">Em Tratamento</option>
                    <option value="POST_PROCEDURE">Pós-Procedimento</option>
                    <option value="INACTIVE">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Contato de Emergência
                  </label>
                  <input
                    type="text"
                    value={novoContatoEmergencia}
                    onChange={(e) => setNovoContatoEmergencia(e.target.value)}
                    placeholder="Nome e parentesco"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Resumo Clínico / Queixa Inicial
                  </label>
                  <textarea
                    rows={2}
                    value={novoResumoClinico}
                    onChange={(e) => setNovoResumoClinico(e.target.value)}
                    placeholder="Resumo de queixas estéticas, alergias ou objetivos do paciente…"
                    className="mt-1 w-full rounded-lg border border-border bg-surface p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalAberto(false);
                    resetForm();
                  }}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {salvando ? "Salvando…" : "Cadastrar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
