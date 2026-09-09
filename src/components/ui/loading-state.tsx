import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "Carregando dados…", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[160px] flex-col items-center justify-center gap-3 p-8 text-center",
        className,
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
