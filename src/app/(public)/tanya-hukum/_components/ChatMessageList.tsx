import { Bot, Scale, User } from "lucide-react";
import DOMPurify from "dompurify";

interface Message {
  role: "user" | "bot";
  text: string;
}

interface ChatMessageListProps {
  messages: Message[];
  loading: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function ChatMessageList({
  messages,
  loading,
  containerRef,
}: ChatMessageListProps) {
  return (
    <div
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar"
      ref={containerRef}
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
            <Scale className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Belum ada percakapan
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            Ajukan pertanyaan hukum atau pilih contoh di bawah
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.role === "bot" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm"
                    : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                }`}
              >
                {msg.role === "bot" ? (
                  <p
                    className="whitespace-pre-line [&_strong]:text-emerald-700 dark:[&_strong]:text-emerald-400 [&_strong]:font-semibold"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      ),
                    }}
                  />
                ) : (
                  <p className="whitespace-pre-line">{msg.text}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">AI sedang berpikir...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
