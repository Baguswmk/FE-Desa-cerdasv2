import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute guestOnly>{children}</ProtectedRoute>;
}
