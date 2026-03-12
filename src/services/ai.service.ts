import api from "../lib/api";

export const aiService = {
  async askQuestion(question: string, sessionId?: string) {
    const response = await api.post("/ai/tanya-hukum", { 
      question,
      session_id: sessionId
    });
    return response.data;
  },

  async getQuota() {
    const response = await api.get("/ai/quota");
    return response.data;
  },

  async getHistory() {
    const response = await api.get("/ai/tanya-hukum/history");
    return response.data;
  },

  async deleteHistorySession(sessionId: string) {
    const response = await api.delete(`/ai/tanya-hukum/history/${sessionId}`);
    return response.data;
  },
};
