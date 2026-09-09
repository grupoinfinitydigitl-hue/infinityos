import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineItemProps {
  date: string;
  title: string;
  badge?: React.ReactNode;
  author?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  isLast?: boolean;
}

export function TimelineItem({
  date,
  title,
  badge,
  author,
  children,
  icon,
  isLast = false,
}: TimelineItemProps) {
  return (
    <div className="relative flex gap-4">
      {/* Linha vertical */}
      {!isLast && (
        <div className="absolute left-3.5 top-7 -bottom-3 w-px bg-border" aria-hidden="true" />
      )}

      {/* Marcador ou Ícone */}
      <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-xs">
        {icon || <div className="h-2 w-2 rounded-full bg-primary" />}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h4 className="font-heading text-sm font-semibold text-foreground">{title}</h4>
            {badge}
          </div>
          <time className="text-[0.7rem] text-muted-foreground">{date}</time>
        </div>

        {author && <p className="mt-0.5 text-xs text-muted-foreground">{author}</p>}

        <div className="mt-2 text-xs leading-relaxed text-foreground/90">{children}</div>
      </div>
    </div>
  );
}

export function Timeline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("relative space-y-1", className)}>{children}</div>;
}
