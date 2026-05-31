import api from "../lib/api";

export interface ZakatConfig {
  id: string;
  key: string;
  value: string;
  label: string;
  unit: string | null;
}

export interface ZakatPeriod {
  id: string;
  title: string;
  type: "FITRAH" | "MAAL" | "PENGHASILAN";
  description: string | null;
  start_date: string;
  end_date: string;
  target_amount: number | null;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  qr_image: string | null;
  collected_amount?: number;
  distributed_amount?: number;
  _count?: { payments: number; distributions: number };
}

export interface ZakatPayment {
  id: string;
  period_id: string;
  payer_name: string;
  zakat_type: string;
  amount: number;
  num_people: number | null;
  message: string | null;
  bukti_transfer: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejected_reason: string | null;
  created_at: string;
  period?: { title: string };
  user?: { nama: string; email: string } | null;
}

export interface ZakatDistribution {
  id: string;
  mustahik_name: string;
  mustahik_category: string;
  amount: number;
  description: string | null;
  bukti_distribusi: string | null;
  dtks_verified: boolean;
  distributed_at: string;
}

export const zakatService = {
  // Config (public)
  async getConfigs() {
    const res = await api.get("/zakat/configs");
    return res.data;
  },

  // Config (admin)
  async updateConfig(key: string, value: string) {
    const res = await api.put(`/zakat/configs/${key}`, { value });
    return res.data;
  },

  async seedConfigs() {
    const res = await api.post("/zakat/configs/seed");
    return res.data;
  },

  // Periods (public)
  async getActivePeriods() {
    const res = await api.get("/zakat/periods/active");
    return res.data;
  },

  async getPeriodById(id: string) {
    const res = await api.get(`/zakat/periods/${id}`);
    return res.data;
  },

  // Periods (admin)
  async getPeriods(page = 1, limit = 10) {
    const res = await api.get(`/zakat/periods?page=${page}&limit=${limit}`);
    return res.data;
  },

  async createPeriod(data: any) {
    const res = await api.post("/zakat/periods", data);
    return res.data;
  },

  async updatePeriod(id: string, data: any) {
    const res = await api.patch(`/zakat/periods/${id}`, data);
    return res.data;
  },

  // Payments
  async createPayment(formData: FormData) {
    const res = await api.post("/zakat/payments", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  async getMyPayments() {
    const res = await api.get("/zakat/my-payments");
    return res.data;
  },

  // Payments (admin)
  async getPendingPayments(page = 1, limit = 20) {
    const res = await api.get(`/zakat/payments/pending?page=${page}&limit=${limit}`);
    return res.data;
  },

  async approvePayment(id: string) {
    const res = await api.put(`/zakat/payments/${id}/approve`);
    return res.data;
  },

  async rejectPayment(id: string, rejected_reason: string) {
    const res = await api.put(`/zakat/payments/${id}/reject`, { rejected_reason });
    return res.data;
  },

  // Distributions
  async getDistributions(periodId: string, page = 1, limit = 20) {
    const res = await api.get(`/zakat/distributions/${periodId}?page=${page}&limit=${limit}`);
    return res.data;
  },

  async createDistribution(formData: FormData) {
    const res = await api.post("/zakat/distributions", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Stats (admin)
  async getStats() {
    const res = await api.get("/zakat/stats");
    return res.data;
  },

  // Public family lookup by KK
  async publicLookupFamily(noKK: string) {
    const res = await api.get(`/zakat/public-lookup?noKK=${noKK}`);
    return res.data;
  },
};
