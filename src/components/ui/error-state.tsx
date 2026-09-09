import React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Não foi possível carregar as informações",
  message = "Ocorreu uma instabilidade na comunicação com o servidor clínico. Nenhuma informação foi perdida.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h4 className="mt-3 font-heading text-sm font-semibold text-foreground">{title}</h4>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-4 text-xs">
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
