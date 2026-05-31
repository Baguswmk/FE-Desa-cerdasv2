import { AlertCircle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  question: string;
  setQuestion: (val: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
  quota: number | null;
  maxQuota: number;
  isLoggedIn: boolean;
  hasMessages: boolean;
}

export default function ChatInput({
  question,
  setQuestion,
  onSubmit,
  loading,
  quota,
  maxQuota,
  isLoggedIn,
  hasMessages,
}: ChatInputProps) {
  const usedQuota = quota !== null ? maxQuota - quota : null;

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-emerald-100 dark:border-gray-700 shrink-0">
      {/* Disclaimer */}
      {hasMessages && (
        <div className="flex gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 px-4 py-2.5 mb-3">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
            Informasi ini bersifat umum dan tidak menggantikan konsultasi
            profesional.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-2 relative">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Pertanyaan Anda
          </label>
          {usedQuota !== null && (
            <span
              className={`text-xs font-bold ${
                quota === 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {usedQuota}/{maxQuota} digunakan
            </span>
          )}
        </div>
        <div className="flex gap-3 items-end">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ketik pertanyaan hukum Anda..."
            disabled={loading || quota === 0}
            rows={2}
            className="flex-1 resize-none border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-500 dark:bg-gray-900 dark:text-gray-100 rounded-xl max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={loading || !question.trim() || quota === 0}
            className="h-12 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg mb-0.5"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        {quota === 0 && (
          <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
            Kuota harian Anda habis ({maxQuota} pertanyaan).{" "}
            {!isLoggedIn && "Login untuk kuota lebih banyak."}
          </p>
        )}
        <p className="text-xs text-gray-400 hidden sm:block">
          Tekan Enter untuk mengirim · Shift+Enter untuk baris baru
        </p>
      </form>
    </div>
  );
}
