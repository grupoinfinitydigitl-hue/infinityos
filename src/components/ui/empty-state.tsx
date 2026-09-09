import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 p-8 md:p-12 text-center",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted-foreground">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm" className="mt-5 text-xs font-medium">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
