import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { PatientStatus, AppointmentStatus } from "@/types/infinity";

export type StatusType =
  PatientStatus | AppointmentStatus | "PENDING" | "DRAFT" | "URGENT" | string;

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.72rem] font-medium tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground border border-border",
        success:
          "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
        warning:
          "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
        danger:
          "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
        info: "bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/60",
        purple:
          "bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60",
        neutral:
          "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface StatusConfig {
  label: string;
  variant: VariantProps<typeof statusBadgeVariants>["variant"];
}

// Mapeamento semântico centralizado de status
const STATUS_DICTIONARY: Record<string, StatusConfig> = {
  // Pacientes
  ACTIVE: { label: "Ativo", variant: "success" },
  INACTIVE: { label: "Inativo", variant: "neutral" },
  IN_TREATMENT: { label: "Em Tratamento", variant: "info" },
  POST_PROCEDURE: { label: "Pós-Procedimento", variant: "purple" },

  // Consultas e Agenda
  SCHEDULED: { label: "Agendado", variant: "info" },
  CONFIRMED: { label: "Confirmado", variant: "success" },
  CHECKED_IN: { label: "Check-in Realizado", variant: "warning" },
  IN_PROGRESS: { label: "Em Atendimento", variant: "warning" },
  COMPLETED: { label: "Concluído", variant: "neutral" },
  CANCELLED: { label: "Cancelado", variant: "danger" },
  NO_SHOW: { label: "Não Compareceu", variant: "danger" },

  // Status Genéricos / Pendências
  PENDING: { label: "Pendente", variant: "warning" },
  DRAFT: { label: "Rascunho", variant: "neutral" },
  URGENT: { label: "Urgente", variant: "danger" },
};

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof statusBadgeVariants> {
  status: StatusType;
  label?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  label,
  variant,
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_DICTIONARY[status] || {
    label: status,
    variant: "default",
  };

  const resolvedVariant = variant || config.variant;
  const resolvedLabel = label || config.label;

  const dotColorClass = {
    default: "bg-muted-foreground",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    purple: "bg-purple-500",
    neutral: "bg-slate-400",
  }[resolvedVariant || "default"];

  return (
    <span className={cn(statusBadgeVariants({ variant: resolvedVariant }), className)} {...props}>
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColorClass)}
          aria-hidden="true"
        />
      )}
      <span>{resolvedLabel}</span>
    </span>
  );
}
