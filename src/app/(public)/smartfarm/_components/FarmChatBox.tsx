"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sprout,
  Bot,
  User,
  MapPin,
  MessageCircle,
  Plus,
  Trash2,
  MessageSquare,
  Loader2,
  Send,
  MapPinOff,
  Leaf,
  Calendar,
} from "lucide-react";
import { smartFarmService } from "@/services/smartfarm.service";
import { useAuth } from "@/hooks/useAuth";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "sonner";
type Message = { role: "user" | "bot"; text: string };
type Session = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

export default function FarmChatBox() {
  const { user } = useAuth();
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    sessionId: string | null;
  }>({ isOpen: false, sessionId: null });

  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [quota, setQuota] = useState<number | null>(null);
  const maxQuota = user ? 50 : 10;
  const usedQuota = quota !== null ? maxQuota - quota : null;

  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages, activeSessionId]);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    smartFarmService
      .getFarmChatQuota()
      .then((res) => setQuota(res.data?.remaining_quota ?? res.data ?? null))
      .catch(() => {});

    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const history = await smartFarmService.getFarmChatHistory();
      if (history.data) {
        const grouped: Record<string, Session> = {};

        [...history.data].reverse().forEach((msg: any) => {
          const sid = msg.session_id || "null";
          if (!grouped[sid]) {
            grouped[sid] = {
              id: sid,
              title:
                msg.question.substring(0, 30) +
                (msg.question.length > 30 ? "..." : ""),
              messages: [],
              createdAt: msg.created_at,
            };
          }
          grouped[sid].messages.push({ role: "user", text: msg.question });
          grouped[sid].messages.push({ role: "bot", text: msg.answer });
        });

        const sessionList = Object.values(grouped).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setSessions(sessionList);

        if (sessionList.length > 0 && !activeSessionId) {
          setActiveSessionId(sessionList[0].id);
        } else if (sessionList.length === 0) {
          setChatMessages([]);
          setActiveSessionId(null);
        }
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find((s) => s.id === activeSessionId);
      if (session) {
        setChatMessages(session.messages);
      } else {
        setChatMessages([]);
      }
    } else {
      setChatMessages([]);
    }
  }, [activeSessionId, sessions]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Browser Anda tidak mendukung deteksi lokasi.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationEnabled(true);
        setLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location", error);
        toast.error(
          "Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.",
        );
        setLocationEnabled(false);
        setUserLocation(null);
        setLocationLoading(false);
      },
    );
  };

  const handleAskFarm = async (promptOverride?: string) => {
    const question = (promptOverride || chatQuestion).trim();
    if (!question || chatLoading) return;
    if (quota === 0) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: `⚠️ Kuota harian Anda sudah habis (${maxQuota} pertanyaan).${!user ? " Login untuk kuota lebih banyak (50/hari)." : ""}`,
        },
      ]);
      return;
    }

    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatQuestion("");
    setTimeout(() => chatInputRef.current?.focus(), 0);
    setChatLoading(true);
    try {
      const response = await smartFarmService.askFarmQuestion(
        question,
        activeSessionId || undefined,
        userLocation?.lat,
        userLocation?.lng,
      );
      const answer =
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
        loadChatHistory();
      } else {
        setChatMessages((prev) => [...prev, { role: "bot", text: answer }]);
        setSessions((prevSessions) =>
          prevSessions.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [
                  ...s.messages,
                  { role: "user", text: question },
                  { role: "bot", text: answer },
                ],
              };
            }
            return s;
          }),
        );
      }
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Gagal mendapatkan jawaban. Coba lagi nanti.";
      setChatMessages((prev) => [...prev, { role: "bot", text: msg }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setChatMessages([]);
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
      await smartFarmService.deleteFarmChatSession(sessionId);
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setChatMessages([]);
      }
      loadChatHistory();
    } catch (error) {
      toast.error("Gagal menghapus obrolan");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-start gap-6 animate-fade-in-up animation-delay-550 w-full mt-8">
      {/* Sidebar - Desktop */}
      <div className="w-full md:w-80 shrink-0 hidden md:block">
        <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl dark:bg-gray-800 h-[700px] flex flex-col sticky top-24">
          <CardHeader className="p-4 border-b border-emerald-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-gray-800/50">
            <Button
              onClick={handleNewChat}
              className="w-full justify-start gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-200 dark:bg-gray-700 dark:text-emerald-400 dark:border-emerald-800/50 dark:hover:bg-gray-600 transition-all font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" /> Obrolan Baru
            </Button>
          </CardHeader>
          <CardContent className="p-2 flex-grow overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
                  Belum ada riwayat
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${activeSessionId === session.id ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800" : "hover:bg-emerald-50 dark:hover:bg-gray-700 border-transparent"} border`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare
                        className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}
                      />
                      <div className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                        {session.title}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSessionClick(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-md transition-all shrink-0"
                      title="Hapus Obrolan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Sidebar */}
      <div className="block md:hidden w-full mb-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
          <Card className="border border-emerald-100 dark:border-gray-700 mb-4 bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="p-3 border-b border-gray-100 dark:border-gray-700">
              <Button
                onClick={handleNewChat}
                className="w-full justify-start gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-gray-700 dark:text-emerald-400 dark:hover:bg-gray-600 transition-all font-semibold"
                size="sm"
              >
                <Plus className="w-4 h-4" /> Obrolan Baru
              </Button>
            </CardHeader>
            <CardContent className="p-2 max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-4">
                    Belum ada riwayat
                  </p>
                ) : (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${activeSessionId === session.id ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800" : "hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent"} border`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate text-sm font-medium dark:text-gray-200">
                          {session.title}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSessionClick(session.id, e)}
                        className="p-1.5 text-red-500 rounded-md shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Farm Chat AI Area */}
      <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-2xl flex-1 flex flex-col h-[700px] w-full min-w-0">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  Tanya AI Pertanian
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Tanyakan panduan budidaya, hama, dll.
                </CardDescription>
              </div>
            </div>
            {usedQuota !== null && (
              <div
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 shrink-0 ${quota === 0 ? "bg-red-50 border-red-200 text-red-700" : quota !== null && quota <= 3 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"}`}
              >
                <MessageCircle className="w-3 h-3" /> {usedQuota}/{maxQuota}{" "}
                digunakan
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 flex flex-col flex-1 overflow-hidden relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
          >
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center fade-in">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-white dark:ring-gray-800">
                  <Sprout className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Konsultasi Pertanian Anda
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                  Ajukan pertanyaan seputar hama, cuaca, atau rekomendasi pupuk
                  untuk tanaman Anda. AI kami akan memandu Anda.
                </p>
              </div>
            ) : (
              <>
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-1 shadow-md">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-tr-sm shadow-md" : "bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"}`}
                    >
                      {msg.role === "bot" ? (
                        <p
                          className="whitespace-pre-line [&_strong]:text-emerald-700 dark:[&_strong]:text-emerald-400 [&_strong]:font-semibold"
                          dangerouslySetInnerHTML={{
                            __html: msg.text.replace(
                              /\*\*(.*?)\*\*/g,
                              "<strong>$1</strong>",
                            ),
                          }}
                        />
                      ) : (
                        <p className="whitespace-pre-line font-medium">
                          {msg.text}
                        </p>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-md">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3 flex items-center gap-2 shadow-sm">
                      <div className="flex gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <span
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-500 ml-2">
                        Sedang berpikir...
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="p-4 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md border-t-2 border-emerald-50 dark:border-gray-700 shrink-0">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAskFarm(
                      "Tanaman apa yang cocok ditanam sekarang melihat kondisi cuaca saat ini?",
                    )
                  }
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs rounded-full bg-white dark:bg-gray-800 shadow-sm transition-all hover:scale-105"
                >
                  <Leaf className="w-3 h-3 mr-1" /> Rekomendasi Tanam
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAskFarm(
                      "Bagaimana cara membuat pupuk organik cair di rumah?",
                    )
                  }
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs rounded-full bg-white dark:bg-gray-800 shadow-sm transition-all hover:scale-105"
                >
                  <Sprout className="w-3 h-3 mr-1" /> Pupuk Organik
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleAskFarm(
                      "Beri saya jadwal perawatan untuk menanam padi lokal.",
                    )
                  }
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs rounded-full bg-white dark:bg-gray-800 shadow-sm transition-all hover:scale-105"
                >
                  <Calendar className="w-3 h-3 mr-1" /> Jadwal Perawatan Padi
                </Button>
              </div>

              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Tanya Chatbot AI
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={
                        locationEnabled
                          ? () => {
                              setLocationEnabled(false);
                              setUserLocation(null);
                            }
                          : handleGetLocation
                      }
                      className={`h-7 px-3 text-xs font-bold rounded-full ${locationEnabled ? "text-emerald-700 bg-emerald-100 dark:bg-emerald-900/40" : "text-gray-500 bg-gray-200 dark:bg-gray-700 dark:text-gray-300"}`}
                    >
                      {locationLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />{" "}
                          Mengambil lokasi...
                        </>
                      ) : locationEnabled ? (
                        <>
                          <MapPin className="w-3 h-3 mr-1" /> Lokasi Aktif
                        </>
                      ) : (
                        <>
                          <MapPinOff className="w-3 h-3 mr-1" /> Gunakan Lokasi
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    ref={chatInputRef}
                    value={chatQuestion}
                    onChange={(e) => setChatQuestion(e.target.value)}
                    placeholder="Ketik keluhan atau pertanyaan Anda..."
                    className="flex-1 border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-emerald-500 shadow-sm resize-none min-h-[50px] max-h-[120px] rounded-xl text-base"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAskFarm();
                      }
                    }}
                    disabled={chatLoading || quota === 0}
                  />
                </div>
                <Button
                  onClick={() => handleAskFarm()}
                  disabled={chatLoading || !chatQuestion.trim() || quota === 0}
                  className="h-[50px] w-[50px] rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg p-0 flex items-center justify-center transform hover:scale-105 transition-all mb-0.5"
                >
                  {chatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
            {quota === 0 && (
              <p className="text-xs text-red-600 font-bold mt-3">
                Kuota habis ({maxQuota}).{" "}
                {!user && "Login untuk dapatkan 50 limit harian."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, sessionId: null })}
        onConfirm={handleConfirmDelete}
        title="Hapus Obrolan"
        description="Lanjutkan menghapus? Obrolan ini akan hilang selamanya."
      />
    </div>
  );
}
