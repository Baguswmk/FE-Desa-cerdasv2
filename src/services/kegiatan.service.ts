import api from "../lib/api";

export const kegiatanService = {
  // GAP 10 (FE): Support filter status untuk tampilkan kegiatan selesai juga
  async getAll(status?: "ACTIVE" | "COMPLETED" | "ALL") {
    const params = status ? `?status=${status}` : "";
    const response = await api.get(`/kegiatan${params}`);
    return response.data;
  },

  async getById(id: string) {
    const response = await api.get(`/kegiatan/${id}`);
    return response.data;
  },

  async create(formData: FormData) {
    const response = await api.post("/kegiatan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async update(id: string, formData: FormData) {
    const response = await api.put(`/kegiatan/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async updateStatus(id: string, status: string) {
    const response = await api.patch(`/kegiatan/${id}/status`, { status });
    return response.data;
  },

  async delete(id: string) {
    const response = await api.delete(`/kegiatan/${id}`);
    return response.data;
  },

  // ── NEW: Tambah foto ke kegiatan yang sudah ada ──────────────────────────
  async addPhotos(id: string, data: FormData) {
    const response = await api.post(`/kegiatan/${id}/photos`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // ── NEW: Hapus satu foto dari kegiatan ──────────────────────────────────
  async deletePhoto(id: string, photoName: string) {
    const response = await api.delete(
      `/kegiatan/${id}/photos/${encodeURIComponent(photoName)}`,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Activity Updates (Perkembangan Kegiatan)
  // ═══════════════════════════════════════════════════════════════════

  async getActivityUpdates(kegiatanId: string) {
    const response = await api.get(`/kegiatan/${kegiatanId}/updates`);
    return response.data;
  },

  async createActivityUpdate(kegiatanId: string, formData: FormData) {
    const response = await api.post(`/kegiatan/${kegiatanId}/updates`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteActivityUpdate(kegiatanId: string, updateId: string) {
    const response = await api.delete(`/kegiatan/${kegiatanId}/updates/${updateId}`);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Expense Reports (Laporan Pengeluaran)
  // ═══════════════════════════════════════════════════════════════════

  async getExpenseReports(kegiatanId: string) {
    const response = await api.get(`/kegiatan/${kegiatanId}/expenses`);
    return response.data;
  },

  async createExpenseReport(kegiatanId: string, formData: FormData) {
    const response = await api.post(`/kegiatan/${kegiatanId}/expenses`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async deleteExpenseReport(kegiatanId: string, reportId: string) {
    const response = await api.delete(`/kegiatan/${kegiatanId}/expenses/${reportId}`);
    return response.data;
  },
};