import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  Sparkles,
  Bed,
  Layers,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Package,
  UserCheck,
  FolderLock,
  BarChart3,
  Settings,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  Activity,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationCenter } from "./notification-center";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const PRIMARY_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Agenda", href: "/agenda", icon: Calendar },
  { label: "Pacientes", href: "/pacientes", icon: Users },
];

const OPERATION_GROUP: NavGroup = {
  groupName: "Operação",
  items: [
    { label: "Consultas", href: "/operacao/consultas", icon: Stethoscope },
    { label: "Prontuários", href: "/operacao/prontuarios", icon: FileText },
    { label: "Procedimentos", href: "/operacao/procedimentos", icon: Sparkles },
    { label: "Centro Cirúrgico", href: "/operacao/centro-cirurgico", icon: Activity },
    { label: "Recuperação", href: "/operacao/recuperacao", icon: Bed },
    { label: "CME", href: "/operacao/cme", icon: Layers },
  ],
};

const MANAGEMENT_GROUP: NavGroup = {
  groupName: "Gestão",
  items: [
    { label: "CRM", href: "/gestao/crm", icon: TrendingUp },
    { label: "Financeiro", href: "/gestao/financeiro", icon: DollarSign },
    { label: "Estoque", href: "/gestao/estoque", icon: Package },
    { label: "Equipe", href: "/gestao/equipe", icon: UserCheck },
    { label: "Documentos", href: "/gestao/documentos", icon: FolderLock },
  ],
};

const SECONDARY_NAV: NavItem[] = [
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Estados expansíveis dos grupos
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Operação: true,
    Gestão: false,
  });

  const toggleGroup = (groupName: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("infinity_os_demo_user");
    navigate({ to: "/login" });
  };

  const isLinkActive = (href: string) => {
    if (href === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const active = isLinkActive(item.href);
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        to={item.href}
        onClick={() => setMobileMenuOpen(false)}
        title={isCollapsed ? item.label : undefined}
        className={cn(
          "group flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
          active
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
          isCollapsed && "justify-center px-2 py-2.5",
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            active
              ? "text-primary-foreground"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        />
        {!isCollapsed && <span className="flex-1 truncate tracking-tight">{item.label}</span>}
        {!isCollapsed && item.badge && (
          <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[0.65rem] font-semibold">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  const renderNavGroup = (group: NavGroup) => {
    const isOpen = openGroups[group.groupName] ?? true;

    return (
      <div key={group.groupName} className="space-y-1 pt-3">
        {!isCollapsed ? (
          <button
            type="button"
            onClick={() => toggleGroup(group.groupName)}
            className="flex w-full items-center justify-between px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground/80 hover:text-foreground"
          >
            <span>{group.groupName}</span>
            {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <div className="my-2 border-t border-border" />
        )}

        {(isOpen || isCollapsed) && (
          <div className="space-y-0.5">{group.items.map((item) => renderNavItem(item))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground antialiased">
      {/* SIDEBAR DESKTOP & TABLET */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-border bg-card transition-all duration-200 lg:flex",
          isCollapsed ? "w-18" : "w-64",
        )}
      >
        {/* Cabeçalho da Sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-border px-3.5">
          {!isCollapsed ? (
            <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <img
                src="/images/infinity-os-logo.png"
                alt="Infinity OS"
                className="h-9 w-auto object-contain shrink-0"
              />
              <div className="flex flex-col truncate">
                <span className="font-heading text-xs font-bold tracking-[0.14em] text-foreground truncate">
                  INFINITY OS
                </span>
                <span className="text-[0.62rem] font-medium tracking-wide text-muted-foreground truncate">
                  Gestão Clínica
                </span>
              </div>
            </Link>
          ) : (
            <Link to="/dashboard" className="mx-auto flex items-center justify-center">
              <img
                src="/images/infinity-os-logo.png"
                alt="Infinity OS"
                className="h-8 w-auto object-contain"
              />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-muted hover:text-foreground"
            title={
              isCollapsed
                ? "Expandir barra lateral"
                : "Recolher barra lateral"
            }
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Itens de Navegação com scroll suave */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {PRIMARY_NAV.map((item) => renderNavItem(item))}
          {renderNavGroup(OPERATION_GROUP)}
          {renderNavGroup(MANAGEMENT_GROUP)}

          <div className="pt-4 mt-2 border-t border-border space-y-0.5">
            {SECONDARY_NAV.map((item) => renderNavItem(item))}
          </div>
        </div>

        {/* Rodapé da Sidebar com perfil e logout */}
        <div className="border-t border-border p-3">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg p-1.5",
              isCollapsed && "justify-center",
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
              R
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-medium text-foreground">Dra. Rhauana Ângela</p>
                <p className="truncate text-[0.65rem] text-muted-foreground">
                  Corpo Clínico · CRM 35139
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* SIDEBAR MOBILE (DRAWER) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-card border-r border-border p-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <img
                  src="/images/infinity-os-logo.png"
                  alt="Infinity OS"
                  className="h-9 w-auto object-contain"
                />
                <div>
                  <span className="font-heading text-sm font-bold tracking-[0.16em] text-foreground">
                    INFINITY OS
                  </span>
                  <p className="text-[0.62rem] text-muted-foreground">
                    Grupo Infinity · Gestão Clínica
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-1">
              {PRIMARY_NAV.map((item) => renderNavItem(item))}
              {renderNavGroup(OPERATION_GROUP)}
              {renderNavGroup(MANAGEMENT_GROUP)}
              <div className="pt-3 border-t border-border space-y-0.5">
                {SECONDARY_NAV.map((item) => renderNavItem(item))}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Encerrar sessão</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          isCollapsed ? "lg:pl-18" : "lg:pl-64",
        )}
      >
        {/* HEADER SUPERIOR FIXO */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <img
                src="/images/infinity-os-logo.png"
                alt="Infinity OS"
                className="h-5 w-auto object-contain"
              />
              <span className="font-semibold text-foreground">Infinity OS</span>
              <span>/</span>
              <span className="capitalize">
                {location.pathname.replace("/", "").split("/")[0] || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Status do Ambiente Clínico */}
            <div className="hidden md:flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[0.7rem] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ambiente Seguro RLS</span>
            </div>

            {/* Central de Notificações */}
            <NotificationCenter />

            {/* Identificação do Usuário */}
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
              <div className="hidden md:block text-left">
                <p className="text-xs font-medium text-foreground leading-none">
                  Dra. Rhauana Ângela
                </p>
                <p className="text-[0.65rem] text-muted-foreground leading-none mt-1">
                  Responsável Técnica
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTAINER DO CONTEÚDO */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
