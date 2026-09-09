import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-sm",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {title}
        </p>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-muted text-foreground/80">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-[0.7rem] font-medium tracking-tight",
              trend.isNeutral
                ? "text-muted-foreground"
                : trend.isPositive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-rose-700 dark:text-rose-400",
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
