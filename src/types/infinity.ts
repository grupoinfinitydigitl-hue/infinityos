// ==========================================================
// INFINITY OS — DEFINIÇÕES DE TIPOS TYPESCRIPT
// ==========================================================

export type UserRole =
  | "ADMINISTRADOR"
  | "COORDENADOR"
  | "MEDICO"
  | "ENFERMAGEM"
  | "FISIOTERAPIA"
  | "RECEPCAO"
  | "FINANCEIRO"
  | "ESTOQUE"
  | "CME";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Professional {
  id: string;
  userId?: string;
  fullName: string;
  councilType: "CRM" | "COREN" | "CREFITO" | "OUTRO";
  councilNumber: string;
  councilState: string;
  phone: string;
  email?: string;
  colorHex: string;
  isActive: boolean;
  specialties: string[];
}

export type PatientStatus = "ACTIVE" | "INACTIVE" | "IN_TREATMENT" | "POST_PROCEDURE";

export interface Patient {
  id: string;
  fullName: string;
  socialName?: string;
  cpf: string;
  birthDate: string;
  gender: "M" | "F" | "OUTRO";
  phone: string;
  email?: string;
  status: PatientStatus;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  clinicalSummary?: string;
  createdAt: string;
  updatedAt: string;
  // Campos relacionais opcionais
  address?: PatientAddress;
  contacts?: PatientContact[];
  documentsCount?: number;
  lastAppointmentDate?: string;
}

export interface PatientAddress {
  id?: string;
  patientId?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface PatientContact {
  id: string;
  patientId: string;
  contactType: "WHATSAPP" | "EMAIL_SEC" | "TELEFONE_RECADO";
  value: string;
  isPrimary: boolean;
}

export type DocumentCategory =
  "CONSENTIMENTO" | "TERMO" | "PRESCRICAO" | "EXAME" | "LAUDO" | "PRONTUARIO" | "ADMINISTRATIVO";

export interface PatientDocument {
  id: string;
  patientId: string;
  title: string;
  category: DocumentCategory;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  createdBy?: string;
  createdAt: string;
}

export type RoomType = "CONSULTORIO" | "CENTRO_CIRURGICO" | "RECUPERACAO" | "PROCEDIMENTOS";

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  isActive: boolean;
}

export interface AppointmentType {
  id: string;
  name: string;
  durationMinutes: number;
  colorHex: string;
  isActive: boolean;
}

export type AppointmentStatus =
  "SCHEDULED" | "CONFIRMED" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  professionalId: string;
  professionalName: string;
  roomId?: string;
  roomName?: string;
  appointmentTypeId: string;
  appointmentTypeName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export type MedicalNoteType =
  | "CONSULTA"
  | "AVALIACAO"
  | "PRIMEIRO_ATENDIMENTO"
  | "PROCEDIMENTO"
  | "EVOLUCAO"
  | "POS_OPERATORIO";

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  weight?: number;
  height?: number;
  oxygenSaturation?: number;
  temperature?: number;
}

export interface MedicalNote {
  id: string;
  medicalRecordId: string;
  patientId: string;
  professionalId?: string;
  professionalName: string;
  professionalCouncil?: string;
  noteDate: string;
  noteType: MedicalNoteType;
  title: string;
  content: string;
  vitalSigns?: VitalSigns;
  conduct?: string;
  createdBy: string;
  createdAt: string;
}

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "VIEW_SENSITIVE_DATA"
  | "EXPORT"
  | "DOCUMENT_ACCESS";

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "URGENT";

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  readAt?: string;
  link?: string;
  createdAt: string;
}

export interface DashboardOverview {
  patientsTodayCount: number;
  appointmentsTodayCount: number;
  proceduresMonthCount: number;
  surgeriesMonthCount: number;
  pendingIssuesCount: number;
  monthlyRevenueFormatted: string;
  todayAppointments: Appointment[];
  pendingItems: {
    id: string;
    title: string;
    description: string;
    category: "DOCUMENT" | "RETURN" | "EXAM" | "PAYMENT" | "PROCEDURE";
    severity: "LOW" | "MEDIUM" | "HIGH";
    date: string;
  }[];
  recentActivity: AuditLog[];
}
