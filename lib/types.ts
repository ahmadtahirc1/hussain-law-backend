export type UserRole = "lawyer" | "staff" | "client"
export type CaseStatus = "open" | "in-progress" | "closed" | "on-hold"
export type AppointmentStatus = "scheduled" | "completed" | "cancelled"

export interface Profile {
  id: string
  first_name: string
  last_name: string
  email: string
  role: UserRole
  phone_number?: string
  created_at: string
  updated_at: string
}

export interface Case {
  id: string
  case_number: string
  title: string
  description?: string
  client_id: string
  lawyer_id: string
  status: CaseStatus
  case_type?: string
  filing_date?: string
  next_hearing_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  case_id?: string
  client_id: string
  lawyer_id: string
  title: string
  description?: string
  appointment_date: string
  duration_minutes: number
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  case_id: string
  uploaded_by: string
  file_name: string
  file_path: string
  file_type?: string
  file_size?: number
  document_type?: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CaseUpdate {
  id: string
  case_id: string
  updated_by: string
  title: string
  description?: string
  update_type?: string
  created_at: string
}
