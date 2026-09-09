import { supabase } from "@/integrations/supabase/client";
import type {
  Patient,
  Appointment,
  AppointmentStatus,
  MedicalNote,
  DashboardOverview,
  PatientStatus,
} from "@/types/infinity";
import { DEMO_PATIENTS, DEMO_APPOINTMENTS, DEMO_MEDICAL_NOTES, DEMO_DASHBOARD } from "./mock-data";
import { logAuditAction } from "./audit-service";

// Armazenamento em memória para dados adicionados/editados na sessão de demonstração
let localPatients: Patient[] = [...DEMO_PATIENTS];
let localAppointments: Appointment[] = [...DEMO_APPOINTMENTS];
let localMedicalNotes: MedicalNote[] = [...DEMO_MEDICAL_NOTES];

// ==========================================
// FUNÇÕES UTILITÁRIAS E MÁSCARAS CLÍNICAS
// ==========================================

export function formatCPF(cpf: string, masked: boolean = true): string {
  const clean = (cpf || "").replace(/\D/g, "");
  if (clean.length !== 11) return cpf || "";

  if (masked) {
    // Exibe apenas os dígitos do meio conforme boas práticas de segurança clínica: ***.456.789-**
    return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`;
  }
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
}

export function formatPhone(phone: string): string {
  const clean = (phone || "").replace(/\D/g, "");
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone || "";
}

export function calculateAge(birthDate: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// ==========================================
// PACIENTES
// ==========================================

export async function getPatients(query?: string, status?: string): Promise<Patient[]> {
  try {
    let supabaseQuery = supabase
      .from("patients")
      .select("*")
      .order("full_name", { ascending: true });

    if (status && status !== "ALL") {
      supabaseQuery = supabaseQuery.eq("status", status);
    }

    const { data, error } = await supabaseQuery;

    if (!error && data && data.length > 0) {
      let list = data.map((d: any): Patient => ({
        id: d.id,
        fullName: d.full_name,
        socialName: d.social_name,
        cpf: d.cpf,
        birthDate: d.birth_date,
        gender: d.gender,
        phone: d.phone,
        email: d.email,
        status: d.status,
        emergencyContactName: d.emergency_contact_name,
        emergencyContactPhone: d.emergency_contact_phone,
        clinicalSummary: d.clinical_summary,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));

      if (query) {
        const q = query.toLowerCase().trim();
        list = list.filter(
          (p) =>
            p.fullName.toLowerCase().includes(q) ||
            p.cpf.includes(q.replace(/\D/g, "")) ||
            p.phone.includes(q.replace(/\D/g, "")),
        );
      }
      return list;
    }
  } catch {
    // Continua para o fallback
  }

  // Fallback para os dados demonstrativos
  let result = [...localPatients];
  if (status && status !== "ALL") {
    result = result.filter((p) => p.status === status);
  }
  if (query) {
    const q = query.toLowerCase().trim();
    const cleanNumbers = q.replace(/\D/g, "");
    result = result.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        (cleanNumbers && p.cpf.includes(cleanNumbers)) ||
        (cleanNumbers && p.phone.replace(/\D/g, "").includes(cleanNumbers)),
    );
  }
  return result;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const { data, error } = await supabase.from("patients").select("*").eq("id", id).single();

    if (!error && data) {
      await logAuditAction({
        action: "VIEW_SENSITIVE_DATA",
        entityType: "patients",
        entityId: id,
        description: `Visualização de ficha clínica do paciente ${data.full_name}`,
      });

      return {
        id: data.id,
        fullName: data.full_name,
        socialName: data.social_name,
        cpf: data.cpf,
        birthDate: data.birth_date,
        gender: data.gender,
        phone: data.phone,
        email: data.email,
        status: data.status,
        emergencyContactName: data.emergency_contact_name,
        emergencyContactPhone: data.emergency_contact_phone,
        clinicalSummary: data.clinical_summary,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    }
  } catch {
    // Continua para o fallback
  }

  const found = localPatients.find((p) => p.id === id);
  if (found) {
    await logAuditAction({
      action: "VIEW_SENSITIVE_DATA",
      entityType: "patients",
      entityId: id,
      description: `Visualização de ficha clínica do paciente ${found.fullName}`,
    });
    return found;
  }
  return null;
}

export async function createPatient(data: {
  fullName: string;
  socialName?: string;
  cpf: string;
  birthDate: string;
  gender: "M" | "F" | "OUTRO";
  phone: string;
  email?: string;
  status?: PatientStatus;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  clinicalSummary?: string;
}): Promise<Patient> {
  const newPatient: Patient = {
    id: `patient-${Date.now()}`,
    fullName: data.fullName.trim(),
    socialName: data.socialName?.trim(),
    cpf: data.cpf.replace(/\D/g, ""),
    birthDate: data.birthDate,
    gender: data.gender,
    phone: data.phone.trim(),
    email: data.email?.trim(),
    status: data.status || "ACTIVE",
    emergencyContactName: data.emergencyContactName?.trim(),
    emergencyContactPhone: data.emergencyContactPhone?.trim(),
    clinicalSummary: data.clinicalSummary?.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documentsCount: 0,
  };

  try {
    const { data: dbData, error } = await supabase
      .from("patients")
      .insert({
        full_name: newPatient.fullName,
        social_name: newPatient.socialName || null,
        cpf: newPatient.cpf,
        birth_date: newPatient.birthDate,
        gender: newPatient.gender,
        phone: newPatient.phone,
        email: newPatient.email || null,
        status: newPatient.status,
        emergency_contact_name: newPatient.emergencyContactName || null,
        emergency_contact_phone: newPatient.emergencyContactPhone || null,
        clinical_summary: newPatient.clinicalSummary || null,
      })
      .select()
      .single();

    if (!error && dbData) {
      newPatient.id = dbData.id;
    }
  } catch {
    // Salva localmente se offline
  }

  localPatients = [newPatient, ...localPatients];

  await logAuditAction({
    action: "CREATE",
    entityType: "patients",
    entityId: newPatient.id,
    description: `Cadastro de novo paciente: ${newPatient.fullName}`,
  });

  return newPatient;
}

// ==========================================
// PRONTUÁRIO CLÍNICO (SOMENTE-ADIÇÃO)
// ==========================================

export async function getMedicalNotes(patientId: string): Promise<MedicalNote[]> {
  try {
    const { data, error } = await supabase
      .from("medical_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("note_date", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        medicalRecordId: d.medical_record_id,
        patientId: d.patient_id,
        professionalId: d.professional_id,
        professionalName: "Dra. Rhauana Ângela",
        professionalCouncil: "CRM/GO 35139",
        noteDate: d.note_date,
        noteType: d.note_type,
        title: d.title,
        content: d.content,
        vitalSigns: d.vital_signs,
        conduct: d.conduct,
        createdBy: d.created_by || "Dra. Rhauana Ângela",
        createdAt: d.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return localMedicalNotes.filter((n) => n.patientId === patientId);
}

export async function addMedicalNote(params: {
  patientId: string;
  title: string;
  noteType: MedicalNote["noteType"];
  content: string;
  conduct?: string;
  vitalSigns?: MedicalNote["vitalSigns"];
  professionalName?: string;
  professionalCouncil?: string;
}): Promise<MedicalNote> {
  const newNote: MedicalNote = {
    id: `note-${Date.now()}`,
    medicalRecordId: `rec-${params.patientId}`,
    patientId: params.patientId,
    professionalName: params.professionalName || "Dra. Rhauana Ângela",
    professionalCouncil: params.professionalCouncil || "CRM/GO 35139",
    noteDate: new Date().toISOString(),
    noteType: params.noteType,
    title: params.title.trim(),
    content: params.content.trim(),
    conduct: params.conduct?.trim(),
    vitalSigns: params.vitalSigns,
    createdBy: params.professionalName || "Dra. Rhauana Ângela",
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from("medical_notes").insert({
      medical_record_id: newNote.medicalRecordId,
      patient_id: newNote.patientId,
      note_date: newNote.noteDate,
      note_type: newNote.noteType,
      title: newNote.title,
      content: newNote.content,
      vital_signs: newNote.vitalSigns || null,
      conduct: newNote.conduct || null,
    });
  } catch {
    // Local fallback
  }

  localMedicalNotes = [newNote, ...localMedicalNotes];

  await logAuditAction({
    action: "CREATE",
    entityType: "medical_notes",
    entityId: newNote.id,
    description: `Nova evolução clínica "${newNote.title}" adicionada ao prontuário`,
  });

  return newNote;
}

// ==========================================
// AGENDA E CONSULTAS
// ==========================================

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select(
        "*, patients(full_name, phone), professionals(full_name), rooms(name), appointment_types(name)",
      )
      .order("start_time", { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        patientId: d.patient_id,
        patientName: d.patients?.full_name || "Paciente",
        patientPhone: d.patients?.phone || "",
        professionalId: d.professional_id,
        professionalName: d.professionals?.full_name || "Profissional",
        roomId: d.room_id,
        roomName: d.rooms?.name || "Consultório",
        appointmentTypeId: d.appointment_type_id,
        appointmentTypeName: d.appointment_types?.name || "Consulta",
        startTime: d.start_time,
        endTime: d.end_time,
        status: d.status,
        notes: d.notes,
        createdAt: d.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return localAppointments;
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus,
): Promise<void> {
  try {
    await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
  } catch {
    // Fallback
  }

  localAppointments = localAppointments.map((app) => (app.id === id ? { ...app, status } : app));

  await logAuditAction({
    action: "UPDATE",
    entityType: "appointments",
    entityId: id,
    description: `Status da consulta alterado para "${status}"`,
  });
}

export async function createAppointment(data: {
  patientId: string;
  professionalId: string;
  roomId?: string;
  appointmentTypeId: string;
  startTime: string;
  endTime: string;
  notes?: string;
}): Promise<Appointment> {
  const patient = localPatients.find((p) => p.id === data.patientId);
  const professional =
    DEMO_DASHBOARD.todayAppointments.find((a) => a.professionalId === data.professionalId)
      ?.professionalName || "Dra. Rhauana Ângela";

  const newApp: Appointment = {
    id: `app-${Date.now()}`,
    patientId: data.patientId,
    patientName: patient?.fullName || "Novo Paciente",
    patientPhone: patient?.phone || "",
    professionalId: data.professionalId,
    professionalName: professional,
    roomId: data.roomId,
    roomName: "Consultório 01",
    appointmentTypeId: data.appointmentTypeId,
    appointmentTypeName: "Avaliação Clínica",
    startTime: data.startTime,
    endTime: data.endTime,
    status: "SCHEDULED",
    notes: data.notes,
    createdAt: new Date().toISOString(),
  };

  try {
    await supabase.from("appointments").insert({
      patient_id: data.patientId,
      professional_id: data.professionalId,
      room_id: data.roomId || null,
      appointment_type_id: data.appointmentTypeId,
      start_time: data.startTime,
      end_time: data.endTime,
      status: "SCHEDULED",
      notes: data.notes || null,
    });
  } catch {
    // Fallback
  }

  localAppointments = [newApp, ...localAppointments];

  await logAuditAction({
    action: "CREATE",
    entityType: "appointments",
    entityId: newApp.id,
    description: `Agendamento criado para ${newApp.patientName}`,
  });

  return newApp;
}

// ==========================================
// DASHBOARD
// ==========================================

export async function getDashboardData(): Promise<DashboardOverview> {
  const appointments = await getAppointments();
  return {
    ...DEMO_DASHBOARD,
    todayAppointments: appointments,
    appointmentsTodayCount: appointments.length,
  };
}
