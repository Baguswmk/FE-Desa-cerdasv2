// Centralized domain types for the frontend.
// Keep all shared types here to avoid scattered `any` and duplicate definitions.

export interface User {
  id: string;
  nama: string;
  email: string;
  no_hp?: string;
  role: "ADMIN" | "WARGA";
  status?: "ACTIVE" | "BANNED";
}

export interface Kegiatan {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  start_date: string;
  end_date?: string | null;
  photos: string[];
  banner?: string | null;
  qr_image?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  village_name?: string | null;
  district?: string | null;
  province?: string | null;
  google_maps_link?: string | null;
  jadwal?: JadwalItem[];
  created_at: string;
  updated_at: string;
}

export interface JadwalItem {
  tanggal: string;
  waktu: string;
  nama_kegiatan: string;
}

export interface Donation {
  id: string;
  kegiatan_id: string;
  user_id?: string | null;
  donor_name?: string | null;
  amount: number;
  message?: string | null;
  bukti_transfer: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_reason?: string | null;
  created_at: string;
  kegiatan?: Pick<Kegiatan, "title">;
  user?: Pick<User, "nama" | "email">;
}

export interface ActivityUpdate {
  id: string;
  kegiatan_id: string;
  title: string;
  description: string;
  photo?: string | null;
  created_at: string;
}

export interface ExpenseReport {
  id: string;
  kegiatan_id: string;
  title: string;
  amount: number;
  receipt_image?: string | null;
  created_at: string;
}

export interface SmartFarm {
  id: string;
  user_id: string;
  plant_name: string;
  plant_date: string;
  location: string;
  weather_data?: any;
  ai_analysis?: string;
  harvest_estimate?: string;
  created_at: string;
  updated_at: string;
}

/** Wrapper for all API responses from the backend */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

/** Wrapper for paginated responses */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
