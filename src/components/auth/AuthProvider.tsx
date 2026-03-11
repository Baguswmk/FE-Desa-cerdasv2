"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  authService,
  type LoginData,
  type RegisterData,
} from "@/services/auth.service";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isWarga: boolean;
  login: (data: LoginData) => Promise<unknown>;
  register: (data: RegisterData) => Promise<unknown>;
  logout: (redirectTo?: string) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = authService.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getCurrentUser();
      const nextUser = response.data as User;
      authService.storeSession(token, nextUser);
      setUser(nextUser);
    } catch {
      authService.clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedUser = authService.getStoredUser() as User | null;
    if (storedUser) {
      setUser(storedUser);
    }

    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (data: LoginData) => {
    const result = await authService.login(data);
    setUser(result.data.user as User);
    return result;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const result = await authService.register(data);
    setUser(result.data.user as User);
    return result;
  }, []);

  const logout = useCallback((redirectTo?: string) => {
    authService.logout(redirectTo);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      isWarga: user?.role === "WARGA",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
}
