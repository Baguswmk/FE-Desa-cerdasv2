import { Plus, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Session {
  id: string;
  title: string;
  createdAt: string;
}

interface SessionSidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  onNewChat: () => void;
  isMobileDrawer?: boolean;
}

export default function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onNewChat,
  isMobileDrawer = false,
}: SessionSidebarProps) {
  const content = (
    <div className="space-y-1">
      {sessions.length === 0 ? (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
          Belum ada riwayat
        </p>
      ) : (
        sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
              activeSessionId === session.id
                ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800"
                : "hover:bg-emerald-50 dark:hover:bg-gray-700 border-transparent"
            } border`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare
                className={`w-4 h-4 shrink-0 ${
                  activeSessionId === session.id
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              />
              <div className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                {session.title}
              </div>
            </div>
            <button
              onClick={(e) => onDeleteSession(session.id, e)}
              className={`${
                isMobileDrawer ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              } p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-md transition-all shrink-0`}
              title="Hapus Obrolan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))
      )}
    </div>
  );

  if (isMobileDrawer) {
    return (
      <Card className="border border-emerald-100 dark:border-gray-700 mb-4 bg-white dark:bg-gray-800 shadow-md">
        <CardHeader className="p-3 border-b border-gray-100 dark:border-gray-700">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-gray-700 dark:text-emerald-400 dark:hover:bg-gray-600 transition-all font-semibold"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Obrolan Baru
          </Button>
        </CardHeader>
        <CardContent className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
          {content}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-80 shrink-0">
      <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl dark:bg-gray-800 h-[calc(100vh-16rem)] flex flex-col sticky top-24">
        <CardHeader className="p-4 border-b border-emerald-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-gray-800/50">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-200 dark:bg-gray-700 dark:text-emerald-400 dark:border-emerald-800/50 dark:hover:bg-gray-600 transition-all font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Obrolan Baru
          </Button>
        </CardHeader>
        <CardContent className="p-2 flex-grow overflow-y-auto custom-scrollbar">
          {content}
        </CardContent>
      </Card>
    </div>
  );
}
