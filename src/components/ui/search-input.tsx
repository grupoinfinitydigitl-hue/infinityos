import React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Buscar…",
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center w-full", containerClassName)}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-8 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary",
          className,
        )}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            if (onClear) onClear();
          }}
          className="absolute right-2.5 flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Limpar busca"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
