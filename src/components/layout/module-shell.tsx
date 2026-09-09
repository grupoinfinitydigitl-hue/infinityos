import React from "react";
import { PageHeader } from "@/components/ui/page-header";
import { LucideIcon, Layers, ShieldCheck, Database, Calendar } from "lucide-react";
import { Link } from "@tanstack/react-router";

export interface ModuleShellProps {
  title: string;
  subtitle: string;
  badgeText?: string;
  icon: LucideIcon;
  databaseTable: string;
  plannedFeatures: string[];
  quickActionLabel?: string;
  quickActionHref?: string;
}

export function ModuleShell({
  title,
  subtitle,
  badgeText = "Fundação Pronta · Fase 2",
  icon: Icon,
  databaseTable,
  plannedFeatures,
  quickActionLabel = "Ver Pacientes",
  quickActionHref = "/pacientes",
}: ModuleShellProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        badge={
          <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[0.7rem] font-semibold text-primary">
            {badgeText}
          </span>
        }
      >
        <Link
          to={quickActionHref}
          className="rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-surface-muted transition-colors"
        >
          {quickActionLabel}
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-primary">
              <Icon className="h-6 w-6 stroke-[1.5]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-foreground">
                Arquitetura Modular Preparada
              </h2>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Este módulo já possui estrutura de banco de dados modelada no PostgreSQL, regras de
                segurança RLS e integração com o ecossistema central do Infinity OS.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Fluxos de Operação Planejados:
            </h3>
            <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {plannedFeatures.map((feat, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface-muted/30 p-2.5 text-xs text-foreground"
                >
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-xs">
          <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <span>Tabelas de Banco Prontas</span>
          </h3>

          <div className="rounded-lg border border-border bg-surface-muted/50 p-3 font-mono text-xs text-muted-foreground">
            <p className="text-[0.68rem] uppercase font-bold text-foreground mb-1">
              Tabela Vinculada:
            </p>
            <code>public.{databaseTable}</code>
          </div>

          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              Os dados e permissões RBAC deste módulo já foram registrados nas migrations do
              Supabase.
            </p>
            <p>
              Qualquer registro cadastrado em <strong>Pacientes</strong> ou <strong>Agenda</strong>{" "}
              estará imediatamente disponível para relacionamento nesta área.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
