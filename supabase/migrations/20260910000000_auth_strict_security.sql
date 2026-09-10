-- ==========================================================
-- INFINITY OS — SEGURANÇA ESTRITA E AUTENTICAÇÃO
-- Apenas e-mails previamente credenciados possuem acesso
-- ==========================================================

-- 1. TABELA DE E-MAILS CREDENCIADOS (LISTA OFICIAL DE PROFISSIONAIS E EQUIPE)
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

-- Permite verificação de credenciamento no momento do login (leitura segura de e-mail e status ativo)
CREATE POLICY "Verificação de e-mail credenciado no login"
    ON public.accredited_emails FOR SELECT
    TO anon, authenticated
    USING (true);

-- Apenas administradores podem inserir ou alterar a lista de credenciados
CREATE POLICY "Gestão de credenciados apenas para administradores"
    ON public.accredited_emails FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role_id = 'ADMINISTRADOR'
        )
    );

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
