"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuthContext } from "./AuthProvider";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "WARGA";
  guestOnly?: boolean;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  guestOnly = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (guestOnly && isAuthenticated) {
      router.replace(user?.role === "ADMIN" ? "/admin/dashboard" : "/warga/dashboard");
      return;
    }

    if (!guestOnly && !isAuthenticated) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }

    if (requiredRole && user && user.role !== requiredRole) {
      router.replace(user.role === "ADMIN" ? "/admin/dashboard" : "/warga/dashboard");
    }
  }, [guestOnly, isAuthenticated, loading, pathname, requiredRole, router, user]);

  if (
    loading ||
    (guestOnly && isAuthenticated) ||
    (!guestOnly && !isAuthenticated) ||
    (requiredRole && user && user.role !== requiredRole)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-emerald-50/20 to-emerald-100/30 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950/20 transition-colors duration-500">
        <div className="text-center p-8 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl border border-white/80 dark:border-gray-850/80 rounded-3xl shadow-2xl max-w-sm w-full mx-4">
          <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-600 dark:to-teal-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20 dark:shadow-emerald-900/30">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-25" />
          </div>
          <h3 className="text-sm font-black text-gray-800 dark:text-gray-100 tracking-wide uppercase">Memverifikasi Sesi</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">Harap tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
