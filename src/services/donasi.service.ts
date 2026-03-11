import api from "../lib/api";

export interface DonationData {
  kegiatan_id: string;
  amount: number;
  donor_name?: string;
  message?: string;
  bukti_transfer: File;
}

// GAP 3 (FE): Validasi file di sisi client sebelum upload
export const validateDonationFile = (
  file: File,
): { valid: boolean; error?: string } => {
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];
  const MAX_SIZE_MB = 2;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Format file tidak valid. Hanya JPG, JPEG, dan PNG yang diperbolehkan.",
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${MAX_SIZE_MB}MB.`,
    };
  }

  return { valid: true };
};

export const donasiService = {
  async createDonation(data: DonationData, isGuest: boolean = false) {
    // GAP 4 (FE): Validasi donor_name wajib untuk guest sebelum hit API
    if (isGuest && !data.donor_name?.trim()) {
      throw new Error("Nama donor wajib diisi untuk donasi tanpa akun");
    }

    // GAP 3 (FE): Validasi file di client
    const fileValidation = validateDonationFile(data.bukti_transfer);
    if (!fileValidation.valid) {
      throw new Error(fileValidation.error);
    }

    const formData = new FormData();
    formData.append("kegiatan_id", data.kegiatan_id);
    formData.append("amount", data.amount.toString());
    if (data.donor_name) {
      formData.append("donor_name", data.donor_name);
    }
    if (data.message) {
      formData.append("message", data.message);
    }
    formData.append("bukti_transfer", data.bukti_transfer);

    const response = await api.post("/donasi", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async getApprovedDonations(kegiatanId: string) {
    const response = await api.get(`/donasi/kegiatan/${kegiatanId}`);
    return response.data;
  },

  async getMyDonations() {
    const response = await api.get("/donasi/my-donations");
    return response.data;
  },

  async getPendingDonations() {
    const response = await api.get("/donasi/pending");
    return response.data;
  },

  async approveDonation(id: string) {
    const response = await api.put(`/donasi/${id}/approve`);
    return response.data;
  },

  async rejectDonation(id: string, reason: string) {
    const response = await api.put(`/donasi/${id}/reject`, {
      rejected_reason: reason,
    });
    return response.data;
  },
};