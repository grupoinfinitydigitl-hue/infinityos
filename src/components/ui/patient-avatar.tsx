import React from "react";
import { cn } from "@/lib/utils";

export interface PatientAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  gender?: "M" | "F" | "OUTRO";
  size?: "sm" | "md" | "lg";
}

export function PatientAvatar({
  name,
  gender,
  size = "md",
  className,
  ...props
}: PatientAvatarProps) {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return "P";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);

  const sizeClasses = {
    sm: "h-7 w-7 text-[0.65rem]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
  }[size];

  // Cores discretas e elegantes
  const bgClasses =
    gender === "F"
      ? "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
      : gender === "M"
        ? "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300"
        : "bg-muted text-muted-foreground border-border";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-medium border select-none",
        sizeClasses,
        bgClasses,
        className,
      )}
      title={name}
      {...props}
    >
      {initials}
    </div>
  );
}
