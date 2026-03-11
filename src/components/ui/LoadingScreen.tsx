import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

/**
 * Full-screen loading overlay.
 * Drop-in replacement for the copy-pasted inline spinner blocks
 * spread across admin/warga dashboard pages.
 *
 * Usage:
 *   if (loading || !user) return <LoadingScreen message="Memuat dashboard..." />;
 */
export function LoadingScreen({ message = "Memuat..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
        <p className="text-lg font-semibold text-gray-700">{message}</p>
      </div>
    </div>
  );
}
