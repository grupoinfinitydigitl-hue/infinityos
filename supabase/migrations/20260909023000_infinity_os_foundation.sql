-- ==========================================================
-- INFINITY OS — FUNDAÇÃO DO SISTEMA CLÍNICO
-- Migração inicial do PostgreSQL / Supabase
-- ==========================================================

-- Habilita extensão pgcrypto / uuid-ossp se necessário
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PERFIS E PERMISSÕES (RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id text PRIMARY KEY,
    module text NOT NULL,
    code text NOT NULL UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id text NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id text NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Perfis dos usuários do sistema
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text,
    avatar_url text,
    role_id text NOT NULL REFERENCES public.roles(id),
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_id text NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

-- 2. PROFISSIONAIS DE SAÚDE
CREATE TABLE IF NOT EXISTS public.professionals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name text NOT NULL,
    council_type text NOT NULL, -- CRM, COREN, CREFITO, etc.
    council_number text NOT NULL,
    council_state text NOT NULL,
    phone text,
    email text,
    color_hex text DEFAULT '#2d3748',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professional_specialties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
    specialty_name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. PACIENTES
CREATE TABLE IF NOT EXISTS public.patients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name text NOT NULL,
    social_name text,
    cpf text NOT NULL,
    birth_date date NOT NULL,
    gender text NOT NULL, -- 'M', 'F', 'OUTRO'
    phone text NOT NULL,
    email text,
    status text NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'IN_TREATMENT', 'POST_PROCEDURE'
    emergency_contact_name text,
    emergency_contact_phone text,
    clinical_summary text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON public.patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);

CREATE TABLE IF NOT EXISTS public.patient_contacts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    contact_type text NOT NULL, -- 'WHATSAPP', 'EMAIL_SEC', 'TELEFONE_RECADO'
    value text NOT NULL,
    is_primary boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.patient_addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    street text NOT NULL,
    number text NOT NULL,
    complement text,
    neighborhood text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip_code text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. DOCUMENTOS CLÍNICOS E ADMINISTRATIVOS DO PACIENTE
CREATE TABLE IF NOT EXISTS public.patient_documents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    title text NOT NULL,
    category text NOT NULL, -- 'CONSENTIMENTO', 'TERMO', 'PRESCRICAO', 'EXAME', 'LAUDO', 'PRONTUARIO', 'ADMINISTRATIVO'
    file_url text NOT NULL,
    file_size integer,
    mime_type text,
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. ESTRUTURA FÍSICA E TIPOS DE ATENDIMENTO
CREATE TABLE IF NOT EXISTS public.rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    type text NOT NULL, -- 'CONSULTORIO', 'CENTRO_CIRURGICO', 'RECUPERACAO', 'PROCEDIMENTOS'
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.appointment_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    duration_minutes integer NOT NULL DEFAULT 30,
    color_hex text DEFAULT '#3b82f6',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. AGENDA E CONSULTAS
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
    room_id uuid REFERENCES public.rooms(id) ON DELETE SET NULL,
    appointment_type_id uuid NOT NULL REFERENCES public.appointment_types(id) ON DELETE RESTRICT,
    start_time timestamptz NOT NULL,
    end_time timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_start ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_prof ON public.appointments(professional_id);

-- 7. PRONTUÁRIO MÉDICO (HISTÓRICO SOMENTE-ADIÇÃO)
CREATE TABLE IF NOT EXISTS public.medical_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.medical_notes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id uuid NOT NULL REFERENCES public.medical_records(id) ON DELETE CASCADE,
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id uuid REFERENCES public.professionals(id) ON DELETE SET NULL,
    note_date timestamptz NOT NULL DEFAULT now(),
    note_type text NOT NULL, -- 'CONSULTA', 'AVALIACAO', 'PRIMEIRO_ATENDIMENTO', 'PROCEDIMENTO', 'EVOLUCAO', 'POS_OPERATORIO'
    title text NOT NULL,
    content text NOT NULL,
    vital_signs jsonb, -- { bp: '120/80', hr: 72, weight: 68.5, height: 165 }
    conduct text,
    created_by uuid REFERENCES public.profiles(id),
    created_at timestamptz NOT NULL DEFAULT now()
    -- REGRA: Sem campo updated_at para garantir append-only rigoroso
);

CREATE INDEX IF NOT EXISTS idx_medical_notes_record ON public.medical_notes(medical_record_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_patient ON public.medical_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_notes_date ON public.medical_notes(note_date DESC);

-- 8. PROCEDIMENTOS
CREATE TABLE IF NOT EXISTS public.procedure_types (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category text NOT NULL, -- 'ESTETICA', 'CIRURGIA_MENOR', 'REGENERATIVA', 'TECNICA_4K'
    estimated_duration_minutes integer NOT NULL DEFAULT 60,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.procedures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE RESTRICT,
    professional_id uuid NOT NULL REFERENCES public.professionals(id) ON DELETE RESTRICT,
    procedure_type_id uuid NOT NULL REFERENCES public.procedure_types(id) ON DELETE RESTRICT,
    room_id uuid REFERENCES public.rooms(id),
    scheduled_date timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'AGENDADO', -- 'AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. AUDITORIA E LOGS DE SEGURANÇA
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL, -- 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'VIEW_SENSITIVE_DATA', 'EXPORT', 'DOCUMENT_ACCESS'
    entity_type text NOT NULL,
    entity_id text,
    metadata jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- 10. NOTIFICAÇÕES
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'INFO', -- 'INFO', 'SUCCESS', 'WARNING', 'URGENT'
    read_at timestamptz,
    link text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read_at);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Regras padrão para usuários autenticados da clínica
CREATE POLICY "Leitura de perfis para autenticados" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura de roles para autenticados" ON public.roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura de profissionais para autenticados" ON public.professionals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura de salas para autenticados" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura de tipos de agendamento" ON public.appointment_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Gestão de pacientes para autenticados" ON public.patients FOR ALL TO authenticated USING (true);
CREATE POLICY "Gestão de consultas para autenticados" ON public.appointments FOR ALL TO authenticated USING (true);
CREATE POLICY "Gestão de prontuários para autenticados" ON public.medical_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Inserção e leitura de notas médicas" ON public.medical_notes FOR ALL TO authenticated USING (true);
CREATE POLICY "Inserção e leitura de auditoria" ON public.audit_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Leitura e atualização de notificações próprias" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id OR user_id IS NULL);

-- ==========================================================
-- SEED INICIAL — PERFIS (ROLES) E ESTRUTURA BÁSICA
-- ==========================================================
INSERT INTO public.roles (id, name, description) VALUES
    ('ADMINISTRADOR', 'Administrador', 'Acesso total à configuração e módulos do sistema'),
    ('COORDENADOR', 'Coordenador(a) Clínico', 'Gestão operacional, escalas e relatórios'),
    ('MEDICO', 'Médico(a)', 'Acesso clínico completo, prontuário, cirurgias e prescrições'),
    ('ENFERMAGEM', 'Enfermagem', 'Acompanhamento de procedimentos, evolução e CME'),
    ('FISIOTERAPIA', 'Fisioterapia Dermato-Funcional', 'Acompanhamento pós-operatório e regenerativo'),
    ('RECEPCAO', 'Recepção', 'Agendamentos, check-in, cadastro de pacientes'),
    ('FINANCEIRO', 'Financeiro', 'Fluxo de caixa, faturamento e cobranças'),
    ('ESTOQUE', 'Estoque', 'Controle de insumos, materiais cirúrgicos e reposição'),
    ('CME', 'CME', 'Central de Material e Esterilização')
ON CONFLICT (id) DO NOTHING;

-- Inserção inicial de salas
INSERT INTO public.rooms (name, type) VALUES
    ('Consultório 01 — Dra. Rhauana', 'CONSULTORIO'),
    ('Consultório 02 — Avaliação Integrada', 'CONSULTORIO'),
    ('Sala de Procedimentos 4K — 01', 'PROCEDIMENTOS'),
    ('Centro Cirúrgico Infinity — Sala A', 'CENTRO_CIRURGICO'),
    ('Recuperação Pós-Procedimento — Leito 01', 'RECUPERACAO'),
    ('Recuperação Pós-Procedimento — Leito 02', 'RECUPERACAO')
ON CONFLICT DO NOTHING;

-- Inserção de tipos de agendamento
INSERT INTO public.appointment_types (name, duration_minutes, color_hex) VALUES
    ('Avaliação Inicial Técnica 4K', 45, '#c5a880'),
    ('Consulta Médica Estética / Regenerativa', 30, '#536878'),
    ('Procedimento Contorno 4K', 150, '#2d5a27'),
    ('Retorno Pós-Procedimento (7 dias)', 20, '#4a5568'),
    ('Sessão Pós-Operatória Fisioterapia', 40, '#805ad5'),
    ('Revisão Clínica Final', 30, '#3182ce')
ON CONFLICT DO NOTHING;
