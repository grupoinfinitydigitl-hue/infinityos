import { useState } from "react";
import { Bell, Check, Clock, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DEMO_NOTIFICATIONS } from "@/services/mock-data";
import type { NotificationItem } from "@/types/infinity";

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
  };

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "URGENT":
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />;
      case "SUCCESS":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case "INFO":
      default:
        return <Info className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Abrir notificações"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[0.62rem] font-bold text-white shadow-xs">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 md:w-96 p-0 shadow-lg border border-border bg-card"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-sm font-semibold text-foreground">Notificações</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground">
                {unreadCount} pendentes
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 text-[0.7rem] text-muted-foreground hover:text-foreground"
            >
              <Check className="mr-1 h-3 w-3" />
              Marcar lidas
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Nenhuma notificação no momento.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-surface-muted/60 ${
                  !n.readAt ? "bg-primary/5 dark:bg-primary/10" : ""
                }`}
              >
                <div className="mt-0.5">{getTypeIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-foreground truncate">{n.title}</p>
                    <span className="text-[0.65rem] text-muted-foreground flex items-center gap-0.5 shrink-0">
                      <Clock className="h-2.5 w-2.5" />
                      hoje
                    </span>
                  </div>
                  <p className="mt-1 text-[0.75rem] text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border p-2 text-center bg-surface-muted/40">
          <p className="text-[0.68rem] text-muted-foreground">Central de Avisos do Infinity OS</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
