import api from "../lib/api";

export interface RegisterData {
  nama: string;
  email: string;
  no_hp?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const validatePasswordStrength = (password: string): string[] => {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Minimal 8 karakter");
  if (!/[A-Z]/.test(password)) errors.push("Minimal 1 huruf besar");
  if (!/[a-z]/.test(password)) errors.push("Minimal 1 huruf kecil");
  if (!/[0-9]/.test(password)) errors.push("Minimal 1 angka");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("Minimal 1 karakter spesial (!@#$%^&*)");
  return errors;
};

export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  const errors = validatePasswordStrength(password);
  const score = Math.max(0, 5 - errors.length - (password.length < 12 ? 1 : 0));

  if (score <= 1) return { score, label: "Sangat Lemah", color: "red" };
  if (score === 2) return { score, label: "Lemah", color: "orange" };
  if (score === 3) return { score, label: "Cukup", color: "yellow" };
  if (score === 4) return { score, label: "Kuat", color: "green" };
  return { score, label: "Sangat Kuat", color: "green" };
};

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const authService = {
  storeSession(token: string, user: unknown) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  async register(data: RegisterData) {
    const response = await api.post("/auth/register", data);
    if (response.data.success) {
      this.storeSession(response.data.data.token, response.data.data.user);
    }
    return response.data;
  },

  async login(data: LoginData) {
    const response = await api.post("/auth/login", data);
    if (response.data.success) {
      this.storeSession(response.data.data.token, response.data.data.user);
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout(redirectTo: string = "/login") {
    this.clearSession();
    if (typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  },

  getStoredUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getDashboardUrl() {
    const user = this.getStoredUser();
    if (!user) return "/login";
    return user.role === "ADMIN" ? "/admin/dashboard" : "/warga/dashboard";
  },
};
