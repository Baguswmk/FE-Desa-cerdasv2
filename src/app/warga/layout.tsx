import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function WargaLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute requiredRole="WARGA">{children}</ProtectedRoute>;
}
