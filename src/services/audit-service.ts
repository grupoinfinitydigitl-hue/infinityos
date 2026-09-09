import { supabase } from "@/integrations/supabase/client";
import type { AuditAction, AuditLog } from "@/types/infinity";
import { DEMO_AUDIT_LOGS } from "./mock-data";

// Armazenamento em memória para sessão atual
let sessionAuditLogs: AuditLog[] = [...DEMO_AUDIT_LOGS];

export interface RecordAuditParams {
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export async function logAuditAction({
  action,
  entityType,
  entityId,
  description,
  metadata,
}: RecordAuditParams): Promise<void> {
  const newLog: AuditLog = {
    id: `audit-${Date.now()}`,
    action,
    entityType,
    entityId,
    description,
    metadata,
    userName: "Equipe Infinity",
    createdAt: new Date().toISOString(),
  };

  // Mantém no feed em memória
  sessionAuditLogs = [newLog, ...sessionAuditLogs];

  try {
    const userRes = await supabase.auth.getUser();
    const user = userRes.data?.user;

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("[Infinity OS Auditoria] Fallback local ativo:", error.message);
    }
  } catch (err) {
    // Falha de rede ou tabela ainda não migrada: não interrompe a ação do usuário
    console.warn("[Infinity OS Auditoria] Log registrado localmente:", err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);

    if (error || !data || data.length === 0) {
      return sessionAuditLogs;
    }

    return data.map((d: any) => ({
      id: d.id,
      userId: d.user_id,
      userName: d.metadata?.user_name || "Profissional Clínico",
      action: d.action,
      entityType: d.entity_type,
      entityId: d.entity_id,
      description: d.metadata?.description || `${d.action} em ${d.entity_type}`,
      metadata: d.metadata,
      createdAt: d.created_at,
    }));
  } catch {
    return sessionAuditLogs;
  }
}
