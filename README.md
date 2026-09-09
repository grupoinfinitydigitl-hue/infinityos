# INFINITY OS — Sistema Integrado de Gestão Clínica

> **Grupo Infinity** — Medicina Estética, Medicina Regenerativa e Procedimentos Cirúrgicos  
> Princípio de Design: _"Complexidade por trás. Simplicidade na frente."_

O **Infinity OS** é a plataforma unificada de operação médica e cirúrgica do Grupo Infinity, desenvolvida para centralizar e conectar todos os fluxos da clínica:

```
PACIENTES → AGENDA → CONSULTAS → PRONTUÁRIOS → PROCEDIMENTOS → CENTRO CIRÚRGICO → RECUPERAÇÃO → CME → ESTOQUE → CRM → FINANCEIRO → RELATÓRIOS
```

---

## 1. Stack Tecnológica

- **Frontend & SSR**: TanStack Start (`@tanstack/react-start`) com `@tanstack/react-router` (rotas baseadas em arquivos, SSR com prerendering e alta performance).
- **Linguagem**: TypeScript com tipagem estrita de entidades clínicas.
- **Componentes & UI**: React 19, Tailwind CSS v4, Radix UI (shadcn/ui), Lucide Icons, Sonner.
- **Backend de Dados & Autenticação**: PostgreSQL + Supabase (Auth, RLS, Storage e Triggers).
- **Design System**: Tipografia Manrope (títulos) e Inter (interface e tabelas), paleta clínica com tokens semânticos centralizados em `src/styles.css`.
- **Hospedagem & Deploy**: Lovable Cloud Preview / Vercel / Cloudflare / Supabase.

---

## 2. Estrutura de Pastas e Arquitetura

```
src/
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx          # Shell com Sidebar retrátil (desktop/tablet/mobile) e Header
│   │   ├── module-shell.tsx       # Estrutura modular preparada para módulos da Fase 2
│   │   └── notification-center.tsx# Central de notificações com contagem de não-lidas
│   └── ui/
│       ├── status-badge.tsx       # Componente unificado para status clínicos e operacionais
│       ├── stat-card.tsx          # Cartões de métricas e indicadores do dashboard
│       ├── patient-avatar.tsx     # Avatar com iniciais e cor contextual
│       ├── search-input.tsx       # Campo de busca com limpeza rápida
│       ├── page-header.tsx        # Cabeçalho padrão de páginas internas
│       ├── timeline.tsx           # Linha do tempo cronológica de prontuários
│       ├── empty-state.tsx        # Estados vazios explicativos
│       ├── loading-state.tsx      # Skeletons e loaders assíncronos
│       └── error-state.tsx        # Mensagens seguras de erro sem expor dados internos
├── integrations/
│   ├── supabase/                  # Cliente Supabase, tipos gerados e middlewares
│   └── lovable/                   # Integrações do ecossistema Lovable
├── routes/
│   ├── __root.tsx                 # Raiz da aplicação com fontes e QueryClient
│   ├── index.tsx                  # Landing Page pública (Técnica 4K)
│   ├── login.tsx                  # Autenticação segura com seletor de perfis demo
│   ├── auth.tsx                   # Rota de acesso legada integrada
│   └── _authenticated/            # Rotas protegidas envolvidas pelo AppShell
│       ├── route.tsx              # Guarda de autenticação (Supabase + Demo)
│       ├── dashboard.tsx          # Dashboard operacional com agenda de hoje e pendências
│       ├── agenda.tsx             # Agenda clínica (visões Dia, Semana e Mês)
│       ├── pacientes/
│       │   ├── index.tsx          # Diretório de pacientes com máscara de CPF e filtros
│       │   └── $pacienteId.tsx    # Prontuário médico detalhado (somente-adição)
│       ├── operacao/
│       │   ├── consultas.tsx      # Fila de atendimento diário
│       │   ├── prontuarios.tsx    # Visão consolidada de prontuários
│       │   ├── procedimentos.tsx  # Técnica 4K e procedimentos minimamente invasivos
│       │   ├── centro-cirurgico.tsx # Escalas de salas e biossegurança
│       │   ├── recuperacao.tsx    # Controle de leitos pós-procedimento
│       │   └── cme.tsx            # Central de Material e Esterilização
│       ├── gestao/
│       │   ├── crm.tsx            # Funil de leads e acompanhamento de retornos
│       │   ├── financeiro.tsx     # Faturamento e repasses da equipe
│       │   ├── estoque.tsx        # Insumos, fios e controle Anvisa
│       │   ├── equipe.tsx         # Equipe multidisciplinar (CRM, COREN, CREFITO)
│       │   └── documentos.tsx     # Repositório de termos digitais e laudos
│       ├── relatorios.tsx         # Relatórios e indicadores clínicos
│       └── configuracoes.tsx      # Perfis RBAC e trilha de auditoria
├── services/
│   ├── clinical-service.ts        # Camada de serviços clínicos com fallback resiliente
│   ├── audit-service.ts           # Trilha de auditoria e segurança
│   └── mock-data.ts               # Dados demonstrativos claramente identificados
├── types/
│   └── infinity.ts                # Modelos e tipagens TypeScript do ecossistema
└── styles.css                     # Tokens de design e identidade visual centralizada
```

---

## 3. Banco de Dados e Relacionamentos

A migração inicial está localizada em:
`supabase/migrations/20260909023000_infinity_os_foundation.sql`

### Principais Tabelas:

| Tabela                             | Finalidade                                              | Regra de Negócio                                                                     |
| :--------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------------------------------- |
| `roles`                            | Perfis de acesso do sistema (9 perfis iniciais)         | Identificadores únicos em maiúsculas                                                 |
| `permissions` & `role_permissions` | Permissões granulares por módulo                        | Validação estrita no servidor                                                        |
| `profiles`                         | Extensão da tabela `auth.users`                         | Vinculada ao ID de autenticação                                                      |
| `professionals`                    | Médicos, cirurgiões, enfermeiros e fisioterapeutas      | Contém CRM/COREN/CREFITO, estado e cor na agenda                                     |
| `patients`                         | Diretório de pacientes da clínica                       | CPF indexado, status clínico e contato de emergência                                 |
| `patient_addresses`                | Endereços estruturados dos pacientes                    | Relacionamento 1:N com `patients`                                                    |
| `patient_documents`                | Termos, consentimentos e laudos                         | Arquivos privados com URLs assinadas                                                 |
| `rooms`                            | Consultórios, salas de procedimentos e centro cirúrgico | Tipificação por ambiente assistencial                                                |
| `appointment_types`                | Procedimentos, consultas e retornos                     | Duração e cores na agenda                                                            |
| `appointments`                     | Consultas e procedimentos agendados                     | Status: SCHEDULED, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW |
| `medical_records`                  | Ficha clínica mãe do paciente                           | Relação 1:1 obrigatória com `patients`                                               |
| `medical_notes`                    | Evoluções e notas de atendimento                        | **Append-only** (sem campo `updated_at`, sem hard delete)                            |
| `procedures`                       | Procedimentos da Técnica 4K e cirurgias menores         | Vinculado a paciente, profissional e sala                                            |
| `audit_logs`                       | Trilha de auditoria e segurança                         | Registra LOGIN, CREATE, UPDATE, DELETE, VIEW_SENSITIVE_DATA                          |
| `notifications`                    | Central de avisos para a equipe                         | Prioridades: INFO, SUCCESS, WARNING, URGENT                                          |

---

## 4. Segurança e Trilha de Auditoria

- **Proteção de Dados Clínicos**: Informações sensíveis de saúde nunca são expostas em URLs abertas ou em logs desnecessários.
- **Máscara de CPF**: Na listagem geral de pacientes, o CPF é exibido como `***.456.789-**`. No prontuário individual, a visualização completa registra evento de auditoria (`VIEW_SENSITIVE_DATA`).
- **Prontuário Imutável**: O histórico médico é estritamente aditivo (_append-only_), garantindo conformidade com as diretrizes do CFM e rastreabilidade jurídica.
- **Auditoria Contínua**: Toda ação crítica (login, cadastro de paciente, adição de nota clínica, alteração de status) é registrada em `audit_logs` com IP e identificação do profissional.

---

## 5. Perfis de Usuário (RBAC)

O sistema implementa 9 papéis funcionais:

1. **ADMINISTRADOR**: Acesso integral e configurações do sistema.
2. **COORDENADOR**: Gestão operacional, escalas e relatórios.
3. **MÉDICO**: Acesso clínico irrestrito, prontuário, prescrições e cirurgias.
4. **ENFERMAGEM**: Triagem, acompanhamento assistencial e controle de leitos.
5. **FISIOTERAPIA**: Reabilitação, drenagem e protocolos pós-operatórios.
6. **RECEPÇÃO**: Agendamentos, check-in e cadastro de pacientes.
7. **FINANCEIRO**: Orçamentos, conciliação e repasses médicos.
8. **ESTOQUE**: Controle de insumos cirúrgicos, fios e farmácia.
9. **CME**: Esterilização e rastreabilidade de instrumentais cirúrgicos.

---

## 6. Instalação e Execução Local

### Pré-requisitos:

- Node.js 18+ (ou Bun)
- npm 9+

### Passos:

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd "Doctor Infinity"

# 2. Instale as dependências
npm install

# 3. Configure o arquivo de variáveis de ambiente (.env)
# Assegure-se de que as chaves do Supabase estejam configuradas:
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"
VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-publica"

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Para testar a compilação de produção:
npm run build
```

O sistema estará disponível em `http://localhost:3000` (ou porta informada pelo Vite).

---

## 7. Como Conectar ao Supabase e Executar as Migrações

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecione seu projeto ou crie um novo.
3. Navegue até **SQL Editor**.
4. Abra o arquivo de migração:
   `supabase/migrations/20260909023000_infinity_os_foundation.sql`
5. Cole o conteúdo no SQL Editor e clique em **Run**.
6. Todas as tabelas, índices, políticas de Row Level Security (RLS) e dados de catálogo serão criados instantaneamente.

> [!TIP]
> **Modo Demonstrativo Resiliente**: Se o banco de dados remoto ainda não tiver as tabelas migradas, o Infinity OS ativa automaticamente a camada de dados em memória (`src/services/mock-data.ts`), permitindo navegação fluida e testes de todas as telas imediatamente.

---

## 8. Perfis de Demonstração para Testes Imediatos

Na tela `/login`, você pode utilizar os atalhos rápidos ou as seguintes credenciais de demonstração:

- **Dra. Rhauana Ângela** (Médica / RT): `dra.rhauana@grupoinfinity.med.br` (Senha: `infinity2026`)
- **Administrador Clínico**: `admin@grupoinfinity.med.br` (Senha: `infinity2026`)
- **Recepção**: `recepcao@grupoinfinity.med.br` (Senha: `infinity2026`)
- **Enfermagem**: `enfermagem@grupoinfinity.med.br` (Senha: `infinity2026`)

---

## 9. Deploy

### Na Vercel:

1. Conecte o repositório GitHub à Vercel.
2. Defina o Framework Preset como **Other** (ou Vite).
3. Build Command: `npm run build`
4. Output Directory: `.output/public`
5. Adicione as variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`).

### No Lovable:

- O repositório está conectado ao Lovable. Todos os commits mantêm a compatibilidade com o editor e o container de preview.
