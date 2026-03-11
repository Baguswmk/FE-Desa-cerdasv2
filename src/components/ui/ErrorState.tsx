import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Error state banner with an optional retry button.
 *
 * Usage:
 *   if (error) return <ErrorState message="Gagal memuat data." onRetry={loadData} />;
 */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-xl font-black text-gray-900 mb-2">
        Terjadi Kesalahan
      </h3>
      <p className="text-gray-600 font-medium mb-6 max-w-sm">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-2 border-red-200 hover:bg-red-50 text-red-700 font-bold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
