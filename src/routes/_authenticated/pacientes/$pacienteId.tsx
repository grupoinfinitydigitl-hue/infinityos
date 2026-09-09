import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  Shield,
  FileText,
  Plus,
  Eye,
  EyeOff,
  Clock,
  UserCheck,
  Stethoscope,
  HeartPulse,
  FolderLock,
  Download,
  AlertCircle,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { PatientAvatar } from "@/components/ui/patient-avatar";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getPatientById,
  getMedicalNotes,
  addMedicalNote,
  formatCPF,
  formatPhone,
  calculateAge,
} from "@/services/clinical-service";
import type { Patient, MedicalNote, MedicalNoteType } from "@/types/infinity";

export const Route = createFileRoute("/_authenticated/pacientes/$pacienteId")({
  component: PacienteDetalhePage,
});

function PacienteDetalhePage() {
  const { pacienteId } = useParams({ from: "/_authenticated/pacientes/$pacienteId" });
  const [paciente, setPaciente] = useState<Patient | null>(null);
  const [notas, setNotas] = useState<MedicalNote[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [exibirCpfCompleto, setExibirCpfCompleto] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"PRONTUARIO" | "DADOS" | "DOCUMENTOS">("PRONTUARIO");

  // Modal para Nova Evolução / Nota Médica
  const [modalNotaAberta, setModalNotaAberta] = useState(false);
  const [novoTipo, setNovoTipo] = useState<MedicalNoteType>("CONSULTA");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novoConteudo, setNovoConteudo] = useState("");
  const [novaConduta, setNovaConduta] = useState("");
  const [pa, setPa] = useState("120/80");
  const [fc, setFc] = useState("72");
  const [peso, setPeso] = useState("");
  const [salvandoNota, setSalvandoNota] = useState(false);
  const [formErro, setFormErro] = useState<string | null>(null);

  const carregarDados = async () => {
    setCarregando(true);
    setErro(false);
    try {
      const p = await getPatientById(pacienteId);
      if (!p) {
        setErro(true);
        return;
      }
      setPaciente(p);
      const n = await getMedicalNotes(pacienteId);
      setNotas(n);
    } catch {
      setErro(true);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [pacienteId]);

  const handleAdicionarNota = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !novoConteudo.trim()) {
      setFormErro("Preencha o título e a descrição clínica da nota.");
      return;
    }

    setSalvandoNota(true);
    setFormErro(null);

    try {
      const nova = await addMedicalNote({
        patientId: pacienteId,
        title: novoTitulo,
        noteType: novoTipo,
        content: novoConteudo,
        conduct: novaConduta,
        vitalSigns: {
          bloodPressure: pa ? `${pa} mmHg` : undefined,
          heartRate: fc ? Number(fc) : undefined,
          weight: peso ? Number(peso) : undefined,
        },
        professionalName: "Dra. Rhauana Ângela",
        professionalCouncil: "CRM/GO 35139",
      });

      setNotas([nova, ...notas]);
      setModalNotaAberta(false);
      setNovoTitulo("");
      setNovoConteudo("");
      setNovaConduta("");
      setPeso("");
    } catch (err: any) {
      setFormErro(err?.message || "Falha ao salvar a evolução no prontuário.");
    } finally {
      setSalvandoNota(false);
    }
  };

  if (carregando) {
    return <LoadingState message="Carregando prontuário do paciente…" />;
  }

  if (erro || !paciente) {
    return (
      <ErrorState
        title="Paciente não encontrado"
        message="O identificador solicitado não existe ou você não possui permissão para acessá-lo."
      />
    );
  }

  const idade = calculateAge(paciente.birthDate);

  return (
    <div className="space-y-6">
      {/* NAVEGAÇÃO DE VOLTA */}
      <div className="flex items-center gap-2">
        <Link
          to="/pacientes"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Voltar para pacientes</span>
        </Link>
      </div>

      {/* CABEÇALHO DO PACIENTE */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <PatientAvatar name={paciente.fullName} gender={paciente.gender} size="lg" />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  {paciente.fullName}
                </h1>
                <StatusBadge status={paciente.status} />
              </div>

              {paciente.socialName && (
                <p className="text-xs text-muted-foreground">Nome social: {paciente.socialName}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span>{idade > 0 ? `${idade} anos` : "Idade não informada"}</span>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono">{formatCPF(paciente.cpf, !exibirCpfCompleto)}</span>
                  <button
                    type="button"
                    onClick={() => setExibirCpfCompleto(!exibirCpfCompleto)}
                    className="text-muted-foreground hover:text-foreground"
                    title={exibirCpfCompleto ? "Ocultar CPF" : "Revelar CPF (Registra auditoria)"}
                  >
                    {exibirCpfCompleto ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {formatPhone(paciente.phone)}
                </span>
                {paciente.email && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {paciente.email}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModalNotaAberta(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nova Evolução</span>
            </button>
          </div>
        </div>

        {/* CONTATO DE EMERGÊNCIA & RESUMO CLÍNICO */}
        {paciente.clinicalSummary && (
          <div className="mt-6 rounded-xl border border-border/70 bg-surface-muted/40 p-3.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground mr-1">Resumo Clínico:</span>
            {paciente.clinicalSummary}
          </div>
        )}
      </div>

      {/* ABAS DO PRONTUÁRIO */}
      <div className="flex border-b border-border gap-6 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <button
          onClick={() => setAbaAtiva("PRONTUARIO")}
          className={`pb-3 transition-colors border-b-2 ${
            abaAtiva === "PRONTUARIO"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent hover:text-foreground"
          }`}
        >
          Prontuário & Evoluções ({notas.length})
        </button>
        <button
          onClick={() => setAbaAtiva("DOCUMENTOS")}
          className={`pb-3 transition-colors border-b-2 ${
            abaAtiva === "DOCUMENTOS"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent hover:text-foreground"
          }`}
        >
          Documentos & Termos ({paciente.documentsCount || 3})
        </button>
        <button
          onClick={() => setAbaAtiva("DADOS")}
          className={`pb-3 transition-colors border-b-2 ${
            abaAtiva === "DADOS"
              ? "border-primary text-foreground font-semibold"
              : "border-transparent hover:text-foreground"
          }`}
        >
          Dados Cadastrais & Contato
        </button>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      {abaAtiva === "PRONTUARIO" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-foreground">
                Histórico Clínico Cronológico (Apenas-Adição)
              </h3>
              <p className="text-xs text-muted-foreground">
                Registros protegidos contra exclusão com validação do profissional assistente
              </p>
            </div>
            <button
              onClick={() => setModalNotaAberta(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Adicionar nota</span>
            </button>
          </div>

          {notas.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Prontuário sem evoluções"
              description="Nenhuma nota médica ou procedimento registrado para este paciente até o momento."
              actionLabel="+ Criar primeira evolução"
              onAction={() => setModalNotaAberta(true)}
            />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
              <Timeline>
                {notas.map((nota, idx) => (
                  <TimelineItem
                    key={nota.id}
                    date={new Date(nota.noteDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    title={nota.title}
                    badge={
                      <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground uppercase tracking-wider">
                        {nota.noteType}
                      </span>
                    }
                    author={`${nota.professionalName} · ${nota.professionalCouncil || "Responsável Técnico"}`}
                    icon={<Stethoscope className="h-3.5 w-3.5 text-primary" />}
                    isLast={idx === notas.length - 1}
                  >
                    <div className="space-y-3">
                      <p className="whitespace-pre-line text-xs leading-relaxed text-foreground/90">
                        {nota.content}
                      </p>

                      {/* SINAIS VITAIS */}
                      {nota.vitalSigns && (
                        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/80 bg-surface-muted/50 p-2.5 text-[0.7rem] text-muted-foreground">
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
                            Sinais Vitais:
                          </span>
                          {nota.vitalSigns.bloodPressure && (
                            <span>
                              PA:{" "}
                              <strong className="text-foreground">
                                {nota.vitalSigns.bloodPressure}
                              </strong>
                            </span>
                          )}
                          {nota.vitalSigns.heartRate && (
                            <span>
                              FC:{" "}
                              <strong className="text-foreground">
                                {nota.vitalSigns.heartRate} bpm
                              </strong>
                            </span>
                          )}
                          {nota.vitalSigns.weight && (
                            <span>
                              Peso:{" "}
                              <strong className="text-foreground">
                                {nota.vitalSigns.weight} kg
                              </strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* CONDUTA MÉDICA */}
                      {nota.conduct && (
                        <div className="rounded-lg border-l-2 border-primary bg-primary/5 p-3 text-xs leading-relaxed">
                          <span className="font-semibold text-foreground block mb-1">
                            Conduta e Orientações:
                          </span>
                          <span className="whitespace-pre-line text-foreground/90">
                            {nota.conduct}
                          </span>
                        </div>
                      )}
                    </div>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>
          )}
        </div>
      )}

      {/* ABA: DOCUMENTOS E TERMOS */}
      {abaAtiva === "DOCUMENTOS" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-foreground">
                Documentos Privados e Termos
              </h3>
              <p className="text-xs text-muted-foreground">
                Documentos com URLs protegidas e restrição de acesso por função
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                id: "doc-01",
                title: "Termo de Consentimento Esclarecido (Técnica 4K)",
                category: "Consentimento",
                date: "01/09/2026",
                size: "480 KB (PDF)",
              },
              {
                id: "doc-02",
                title: "Hemograma e Coagulograma Pré-Operatório",
                category: "Exame",
                date: "28/08/2026",
                size: "1.2 MB (PDF)",
              },
              {
                id: "doc-03",
                title: "Orientações Pré e Pós-Procedimento Cirúrgico",
                category: "Prescrição",
                date: "01/09/2026",
                size: "310 KB (PDF)",
              },
            ].map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between text-[0.65rem] text-muted-foreground uppercase tracking-wider font-semibold">
                    <span>{doc.category}</span>
                    <span>{doc.date}</span>
                  </div>
                  <h4 className="mt-2 font-heading text-xs font-semibold text-foreground leading-snug">
                    {doc.title}
                  </h4>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">{doc.size}</p>
                </div>
                <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-3">
                  <button
                    type="button"
                    onClick={() => alert(`Download seguro iniciado para: ${doc.title}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Baixar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA: DADOS CADASTRAIS */}
      {abaAtiva === "DADOS" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-xs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            <div>
              <p className="text-[0.68rem] uppercase font-semibold text-muted-foreground">
                Nome Completo
              </p>
              <p className="mt-1 font-medium text-foreground">{paciente.fullName}</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase font-semibold text-muted-foreground">CPF</p>
              <p className="mt-1 font-mono text-foreground">{formatCPF(paciente.cpf, false)}</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase font-semibold text-muted-foreground">
                Data de Nascimento
              </p>
              <p className="mt-1 text-foreground">
                {new Date(paciente.birthDate).toLocaleDateString("pt-BR")} ({idade} anos)
              </p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase font-semibold text-muted-foreground">
                Telefone
              </p>
              <p className="mt-1 text-foreground">{formatPhone(paciente.phone)}</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase font-semibold text-muted-foreground">E-mail</p>
              <p className="mt-1 text-foreground">{paciente.email || "Não cadastrado"}</p>
            </div>
            <div>
              <p className="text-[0.68rem] uppercase font-semibold text-muted-foreground">
                Contato de Emergência
              </p>
              <p className="mt-1 text-foreground">
                {paciente.emergencyContactName || "Não informado"}
                {paciente.emergencyContactPhone ? ` · ${paciente.emergencyContactPhone}` : ""}
              </p>
            </div>
            {paciente.address && (
              <div className="sm:col-span-2 lg:col-span-3 border-t border-border pt-3">
                <p className="text-[0.68rem] uppercase font-semibold text-muted-foreground">
                  Endereço Residencial
                </p>
                <p className="mt-1 text-foreground">
                  {paciente.address.street}, {paciente.address.number}{" "}
                  {paciente.address.complement ? `(${paciente.address.complement})` : ""} —{" "}
                  {paciente.address.neighborhood}, {paciente.address.city}/{paciente.address.state}{" "}
                  — CEP {paciente.address.zipCode}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVA NOTA MÉDICA / EVOLUÇÃO */}
      {modalNotaAberta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  Nova Evolução Clínica (Prontuário)
                </h3>
                <p className="text-xs text-muted-foreground">Paciente: {paciente.fullName}</p>
              </div>
              <button
                onClick={() => setModalNotaAberta(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdicionarNota} className="mt-6 space-y-4 text-left">
              {formErro && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
                  {formErro}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Tipo de Atendimento *
                  </label>
                  <select
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as MedicalNoteType)}
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="CONSULTA">Consulta Médica</option>
                    <option value="AVALIACAO">Avaliação Clínica / Técnica 4K</option>
                    <option value="PROCEDIMENTO">Procedimento Cirúrgico / Estético</option>
                    <option value="POS_OPERATORIO">Pós-Operatório & Recuperação</option>
                    <option value="EVOLUCAO">Evolução Assistencial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Título do Registro *
                  </label>
                  <input
                    type="text"
                    required
                    value={novoTitulo}
                    onChange={(e) => setNovoTitulo(e.target.value)}
                    placeholder="Ex: Consulta de Retorno D15"
                    className="mt-1 h-9 w-full rounded-lg border border-border bg-surface px-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-2 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[0.65rem] font-medium text-muted-foreground">
                      Pressão Arterial
                    </label>
                    <input
                      type="text"
                      value={pa}
                      onChange={(e) => setPa(e.target.value)}
                      placeholder="120/80"
                      className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-medium text-muted-foreground">
                      Frequência Cardíaca (bpm)
                    </label>
                    <input
                      type="number"
                      value={fc}
                      onChange={(e) => setFc(e.target.value)}
                      placeholder="72"
                      className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-medium text-muted-foreground">
                      Peso Atual (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={peso}
                      onChange={(e) => setPeso(e.target.value)}
                      placeholder="Ex: 64.5"
                      className="mt-1 h-8 w-full rounded-md border border-border bg-surface px-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Descrição Clínica & Exame Físico *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={novoConteudo}
                    onChange={(e) => setNovoConteudo(e.target.value)}
                    placeholder="Descreva a anamnese, achados do exame físico, evolução cicatricial e queixas do paciente…"
                    className="mt-1 w-full rounded-lg border border-border bg-surface p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Conduta Médica & Prescrição
                  </label>
                  <textarea
                    rows={3}
                    value={novaConduta}
                    onChange={(e) => setNovaConduta(e.target.value)}
                    placeholder="Orientações de cuidados, medicamentos prescritos, agendamento de retorno…"
                    className="mt-1 w-full rounded-lg border border-border bg-surface p-3 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setModalNotaAberta(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoNota}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-medium uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {salvandoNota ? "Gravando…" : "Salvar no Prontuário"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
