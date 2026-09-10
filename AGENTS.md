# INFINITY OS — Diretrizes do Projeto

## Princípios de Engenharia
- **Design System**: Tipografia institucional Manrope (títulos) e Inter (interface), paleta com tokens semânticos em `src/styles.css`.
- **Rotas e Páginas**: TanStack Start e TanStack Router com arquivos estritamente tipados.
- **Segurança & LGPD**: Prontuários clínicos imutáveis (*append-only*), máscara de CPF em visualizações públicas e controle de acesso baseado em papéis (RBAC).
- **Banco de Dados**: PostgreSQL + Supabase com RLS (Row Level Security).
