-- ==========================================================
-- INFINITY OS — SEGURANÇA ESTRITA E AUTENTICAÇÃO
-- Apenas e-mails previamente credenciados possuem acesso
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ESTRUTURA DE PAPÉIS (ROLES)
CREATE TABLE IF NOT EXISTS public.roles (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.roles (id, name, description) VALUES
    ('ADMINISTRADOR', 'Administrador do Sistema', 'Acesso irrestrito a configurações, auditoria e cadastros'),
    ('MEDICO', 'Médico / Corpo Clínico', 'Atendimento clínico, prontuários, prescrições e cirurgias'),
    ('ENFERMAGEM', 'Equipe de Enfermagem', 'Triagem, checagem de sinais vitais, CME e centro cirúrgico'),
    ('RECEPCAO', 'Recepção e Atendimento', 'Agendamento de consultas, cadastro de pacientes e pagamentos')
ON CONFLICT (id) DO NOTHING;

-- 2. PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    phone text,
    avatar_url text,
    role_id text NOT NULL REFERENCES public.roles(id) DEFAULT 'RECEPCAO',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Perfis visíveis por usuários autenticados'
    ) THEN
        CREATE POLICY "Perfis visíveis por usuários autenticados"
            ON public.profiles FOR SELECT
            TO authenticated
            USING (true);
    END IF;
END $$;

-- 3. TABELA DE E-MAILS CREDENCIADOS (LISTA OFICIAL DE PROFISSIONAIS E EQUIPE)
CREATE TABLE IF NOT EXISTS public.accredited_emails (
    email text PRIMARY KEY,
    full_name text NOT NULL,
    role_id text NOT NULL REFERENCES public.roles(id) DEFAULT 'MEDICO',
    is_active boolean NOT NULL DEFAULT true,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Habilita RLS
ALTER TABLE public.accredited_emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'accredited_emails' AND policyname = 'Verificação de e-mail credenciado no login'
    ) THEN
        CREATE POLICY "Verificação de e-mail credenciado no login"
            ON public.accredited_emails FOR SELECT
            TO anon, authenticated
            USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'accredited_emails' AND policyname = 'Gestão de credenciados apenas para administradores'
    ) THEN
        CREATE POLICY "Gestão de credenciados apenas para administradores"
            ON public.accredited_emails FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE id = auth.uid() AND role_id = 'ADMINISTRADOR'
                )
            );
    END IF;
END $$;

-- 2. SEMENTE INICIAL DE PROFISSIONAIS E COLABORADORES CREDENCIADOS
INSERT INTO public.accredited_emails (email, full_name, role_id, is_active, notes) VALUES
    ('dra.rhauana@grupoinfinity.med.br', 'Dra. Rhauana Ângela', 'MEDICO', true, 'Médica e Responsável Técnica'),
    ('admin@grupoinfinity.med.br', 'Administração Geral', 'ADMINISTRADOR', true, 'Gestão total do sistema'),
    ('diretoria@grupoinfinity.med.br', 'Diretoria Médica', 'ADMINISTRADOR', true, 'Diretoria Executiva'),
    ('recepcao@grupoinfinity.med.br', 'Recepção Clínica', 'RECEPCAO', true, 'Agendamentos e cadastro'),
    ('enfermagem@grupoinfinity.med.br', 'Equipe de Enfermagem', 'ENFERMAGEM', true, 'Centro Cirúrgico e CME')
ON CONFLICT (email) DO UPDATE
SET is_active = EXCLUDED.is_active;

-- 3. TRIGGER PARA SINCRONIZAÇÃO ENTRE AUTH.USERS E PROFILES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_accredited public.accredited_emails%ROWTYPE;
BEGIN
    SELECT * INTO v_accredited
    FROM public.accredited_emails
    WHERE LOWER(email) = LOWER(NEW.email) AND is_active = true;

    IF NOT FOUND THEN
        -- Usuário não credenciado recebe perfil bloqueado (is_active = false)
        INSERT INTO public.profiles (id, full_name, email, role_id, is_active)
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NEW.email,
            'RECEPCAO',
            false
        )
        ON CONFLICT (id) DO UPDATE
        SET is_active = false;
    ELSE
        -- Usuário credenciado é associado com nome e cargo oficiais
        INSERT INTO public.profiles (id, full_name, email, role_id, is_active)
        VALUES (
            NEW.id,
            v_accredited.full_name,
            NEW.email,
            v_accredited.role_id,
            true
        )
        ON CONFLICT (id) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            role_id = EXCLUDED.role_id,
            is_active = true,
            updated_at = now();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Função auxiliar de segurança para validação de staff ativo
CREATE OR REPLACE FUNCTION public.is_active_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;
