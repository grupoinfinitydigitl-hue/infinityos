import React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children?: React.ReactNode; // Actions slot
  className?: string;
}

export function PageHeader({ title, subtitle, badge, children, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border/80 pb-5 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{subtitle}</p>
        )}
      </div>

      {children && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{children}</div>}
    </div>
  );
}
