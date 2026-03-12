import api from "../lib/api";

export interface SmartFarmData {
  plant_name: string;
  plant_date: string;
  location: string;
}

export interface CreateFarmData {
  crop_type: string;
  area_size: number | string;
  location: string;
  soil_type: string;
  current_condition: string;
}

export const smartFarmService = {
  async createFarmRecord(data: SmartFarmData) {
    const response = await api.post("/smartfarm", data);
    return response.data;
  },

  // Used by the warga SmartFarm page
  async createFarm(data: CreateFarmData) {
    const response = await api.post("/smartfarm", {
      ...data,
      area_size: Number(data.area_size),
    });
    return response.data;
  },

  async getUserFarms() {
    const response = await api.get("/smartfarm");
    return response.data;
  },

  async getFarmById(id: string) {
    const response = await api.get(`/smartfarm/${id}`);
    return response.data;
  },

  async deleteFarmRecord(id: string) {
    const response = await api.delete(`/smartfarm/${id}`);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════════
  //  Farm Chat (Tanya Jawab Pertanian AI)
  // ═══════════════════════════════════════════════════════════════════

  async askFarmQuestion(
    question: string,
    sessionId?: string,
    latitude?: number,
    longitude?: number
  ) {
    const response = await api.post("/smartfarm/chat", {
      question,
      session_id: sessionId,
      latitude,
      longitude,
    });
    return response.data;
  },

  async getFarmChatHistory() {
    const response = await api.get("/smartfarm/chat/history");
    return response.data;
  },

  async deleteFarmChatSession(sessionId: string) {
    const response = await api.delete(`/smartfarm/chat/history/${sessionId}`);
    return response.data;
  },

  async getFarmChatQuota() {
    const response = await api.get("/smartfarm/chat/quota");
    return response.data;
  },
};
