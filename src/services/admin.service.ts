import api from "../lib/api";

export const adminService = {
  async getDashboardStats() {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  async getActivityLogs(limit: number = 50) {
    const response = await api.get(`/admin/logs?limit=${limit}`);
    return response.data;
  },

  async getAllUsers() {
    const response = await api.get("/admin/users");
    return response.data;
  },

  async updateUserStatus(userId: string, status: "ACTIVE" | "BANNED") {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  async exportDonations(
    format: "excel" | "pdf" = "excel",
    status: "APPROVED" | "PENDING" | "REJECTED" | "ALL" = "APPROVED",
  ) {
    const response = await api.get(
      `/admin/reports/export?format=${format}&status=${status}`,
      { responseType: "blob" },
    );

    const blob = new Blob([response.data], {
      type:
        format === "excel"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-donasi-${status.toLowerCase()}-${Date.now()}.${
      format === "excel" ? "xlsx" : "pdf"
    }`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },
};