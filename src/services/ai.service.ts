import api from "../lib/api";

export const aiService = {
  async askQuestion(question: string) {
    const response = await api.post("/ai/tanya-hukum", { question });
    return response.data;
  },

  async getQuota() {
    const response = await api.get("/ai/quota");
    return response.data;
  },
};
