CREATE TABLE public.solicitacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  telefone text NOT NULL,
  regiao text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.solicitacoes TO anon;
GRANT SELECT, INSERT ON public.solicitacoes TO authenticated;
GRANT ALL ON public.solicitacoes TO service_role;

ALTER TABLE public.solicitacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa pode enviar solicitacao"
  ON public.solicitacoes FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(nome) BETWEEN 2 AND 100
    AND char_length(telefone) BETWEEN 8 AND 30
    AND char_length(regiao) BETWEEN 2 AND 100
  );

CREATE POLICY "Usuarios autenticados podem ver solicitacoes"
  ON public.solicitacoes FOR SELECT TO authenticated
  USING (true);

CREATE INDEX solicitacoes_created_at_idx ON public.solicitacoes (created_at DESC);