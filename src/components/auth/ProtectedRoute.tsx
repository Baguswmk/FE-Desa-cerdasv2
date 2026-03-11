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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-600">Memverifikasi sesi...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
