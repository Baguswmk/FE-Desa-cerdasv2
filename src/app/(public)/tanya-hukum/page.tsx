"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Bot } from "lucide-react";
import { aiService } from "@/services/ai.service";
import { useAuth } from "@/hooks/useAuth";
import ConfirmModal from "@/components/ConfirmModal";

// Sub-components
import LegalHero from "./_components/LegalHero";
import SessionSidebar from "./_components/SessionSidebar";
import ChatMessageList from "./_components/ChatMessageList";
import ChatInput from "./_components/ChatInput";
import ExampleQuestions from "./_components/ExampleQuestions";

const exampleQuestions = [
  "Bagaimana prosedur pengurusan KTP yang hilang?",
  "Apa syarat pengurusan surat keterangan usaha?",
  "Bagaimana cara mengurus surat keterangan tidak mampu?",
  "Apa saja dokumen yang diperlukan untuk menikah?",
];

type Message = { role: "user" | "bot"; text: string };
type Session = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

export default function TanyaHukumPage() {
  const { user } = useAuth();
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [quota, setQuota] = useState<number | null>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    sessionId: string | null;
  }>({
    isOpen: false,
    sessionId: null,
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeSessionId]);

  // Fetch quota on mount
  useEffect(() => {
    aiService
      .getQuota()
      .then((res) => setQuota(res.data?.remaining_quota ?? res.data ?? null))
      .catch(() => {});
  }, []);

  // Fetch history on mount if logged in
  const loadHistory = () => {
    if (user) {
      setLoading(true);
      aiService
        .getHistory()
        .then((res) => {
          const historyData = res.data?.data || res.data || [];
          const grouped: Record<string, Session> = {};

          [...historyData].reverse().forEach((q: any) => {
            const sid = q.session_id || "null";
            if (!grouped[sid]) {
              grouped[sid] = {
                id: sid,
                title:
                  q.question.substring(0, 30) +
                  (q.question.length > 30 ? "..." : ""),
                messages: [],
                createdAt: q.created_at,
              };
            }
            grouped[sid].messages.push({ role: "user", text: q.question });
            grouped[sid].messages.push({ role: "bot", text: q.answer });
          });

          const sessionList = Object.values(grouped).sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          setSessions(sessionList);

          if (sessionList.length > 0 && !activeSessionId) {
            setActiveSessionId(sessionList[0].id);
          } else if (sessionList.length === 0 && !activeSessionId) {
            setMessages([]);
            setActiveSessionId(null);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user]);

  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find((s) => s.id === activeSessionId);
      if (session) {
        setMessages(session.messages);
      }
    } else {
      setMessages([]);
    }
  }, [activeSessionId, sessions]);

  const maxQuota = user ? 50 : 10;

  const handleSubmit = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const q = (override || question).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await aiService.askQuestion(
        q,
        activeSessionId || undefined,
      );
      const ans =
        response.data?.answer ||
        response.data?.data?.answer ||
        "Maaf, tidak ada jawaban.";
      const newSessionId =
        response.data?.session_id || response.data?.data?.session_id;
      const remQuota =
        response.data?.remaining_quota ?? response.data?.data?.remaining_quota;

      if (remQuota !== undefined) setQuota(remQuota);

      if (!activeSessionId && newSessionId) {
        setActiveSessionId(newSessionId);
        setMessages((prev) => [...prev, { role: "bot", text: ans }]);
        loadHistory();
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: ans }]);
        setSessions((prevSessions) =>
          prevSessions.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [
                  ...s.messages,
                  { role: "user", text: q },
                  { role: "bot", text: ans },
                ],
              };
            }
            return s;
          }),
        );
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ?? "Gagal mendapatkan jawaban.";
      setMessages((prev) => [...prev, { role: "bot", text: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    if (isSidebarOpen) setIsSidebarOpen(false);
  };

  const handleDeleteSessionClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete({ isOpen: true, sessionId });
  };

  const handleConfirmDelete = async () => {
    const sessionId = confirmDelete.sessionId;
    if (!sessionId) return;

    try {
      setConfirmDelete({ isOpen: false, sessionId: null });
      await aiService.deleteHistorySession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      loadHistory();
    } catch (error) {
      alert("Gagal menghapus obrolan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]" />
      </div>

      <Navbar currentPage="tanya-hukum" />

      <LegalHero quota={quota} maxQuota={maxQuota} />

      {/* DESKTOP LAYOUT */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 hidden md:flex items-start gap-6">
        <SessionSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
          onDeleteSession={handleDeleteSessionClick}
          onNewChat={handleNewChat}
        />

        <div className="flex-1 w-full max-w-4xl min-w-0 flex flex-col gap-6">
          <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-2xl dark:bg-gray-800 flex flex-col h-[600px]">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700 py-4 px-6 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    Asisten Hukum AI
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Tanyakan seputar hukum & administrasi desa
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
              <ChatMessageList
                messages={messages}
                loading={loading}
                containerRef={chatContainerRef}
              />
              <ChatInput
                question={question}
                setQuestion={setQuestion}
                onSubmit={handleSubmit}
                loading={loading}
                quota={quota}
                maxQuota={maxQuota}
                isLoggedIn={!!user}
                hasMessages={messages.length > 0}
              />
            </CardContent>
          </Card>

          <ExampleQuestions
            questions={exampleQuestions}
            onSubmit={(q) => handleSubmit(undefined, q)}
            loading={loading}
            quota={quota}
          />
        </div>
      </div>

      {/* MOBILE LAYOUT */}
      <div className="block md:hidden max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Riwayat Obrolan
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Tutup" : "Lihat Obrolan"}
          </Button>
        </div>

        {isSidebarOpen && (
          <SessionSidebar
            isMobileDrawer
            sessions={sessions}
            activeSessionId={activeSessionId}
            onSelectSession={(id) => {
              setActiveSessionId(id);
              setIsSidebarOpen(false);
            }}
            onDeleteSession={handleDeleteSessionClick}
            onNewChat={handleNewChat}
          />
        )}

        <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl dark:bg-gray-800 flex flex-col h-[600px]">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700 py-3 px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">
                Asisten Hukum AI
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
            <ChatMessageList
              messages={messages}
              loading={loading}
              containerRef={chatContainerRef}
            />
            <ChatInput
              question={question}
              setQuestion={setQuestion}
              onSubmit={handleSubmit}
              loading={loading}
              quota={quota}
              maxQuota={maxQuota}
              isLoggedIn={!!user}
              hasMessages={messages.length > 0}
            />
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, sessionId: null })}
        onConfirm={handleConfirmDelete}
        title="Hapus Obrolan"
        description="Apakah Anda yakin ingin menghapus obrolan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  );
}
