"use client";

import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  Scale,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Bot,
  User,
  Send,
  MessageSquare,
  Plus,
  Trash2,
  Menu,
} from "lucide-react";
import { aiService } from "@/services/ai.service";
import { useAuth } from "@/hooks/useAuth";

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

  // Chat Room states
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, activeSessionId]);

  // Fetch quota on mount
  useEffect(() => {
    aiService.getQuota()
      .then((res) => setQuota(res.data?.remaining_quota ?? res.data ?? null))
      .catch(() => {});
  }, []);

  // Fetch history on mount if logged in
  const loadHistory = () => {
    if (user) {
      setLoading(true);
      aiService.getHistory()
        .then((res) => {
          const historyData = res.data || [];
          
          // Group by session_id
          const grouped: Record<string, Session> = {};
          
          historyData.reverse().forEach((q: any) => {
            const sid = q.session_id || "default";
            if (!grouped[sid]) {
              grouped[sid] = {
                id: sid,
                title: q.question.substring(0, 30) + (q.question.length > 30 ? "..." : ""),
                messages: [],
                createdAt: q.created_at,
              };
            }
            grouped[sid].messages.push({ role: "user", text: q.question });
            grouped[sid].messages.push({ role: "bot", text: q.answer });
          });

          // Sort sessions by newest first
          const sessionList = Object.values(grouped).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          setSessions(sessionList);
          
          // If no active session, but there are sessions, select the first one
          if (sessionList.length > 0 && !activeSessionId) {
            setActiveSessionId(sessionList[0].id);
          } else if (sessionList.length === 0) {
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

  // Update visible messages when activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find((s) => s.id === activeSessionId);
      if (session) {
        setMessages(session.messages);
      } else {
        setMessages([]);
      }
    } else {
      setMessages([]);
    }
  }, [activeSessionId, sessions]);

  const maxQuota = user ? 50 : 10;
  const usedQuota = quota !== null ? maxQuota - quota : null;

  const handleSubmit = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const q = (override || question).trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await aiService.askQuestion(q, activeSessionId || undefined);
      const ans = response.data?.answer ?? "Maaf, tidak ada jawaban.";
      const newSessionId = response.data?.session_id;
      const remQuota = response.data?.remaining_quota;
      
      if (remQuota !== undefined) setQuota(remQuota);
      
      // If this was a new session (no activeSessionId before), force a reload to get proper grouping & title
      if (!activeSessionId && newSessionId) {
        setActiveSessionId(newSessionId);
        loadHistory();
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: ans }]);
        // Update local state session silently
        setSessions(prevSessions => prevSessions.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, { role: "user", text: q }, { role: "bot", text: ans }]
            };
          }
          return s;
        }));
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Gagal mendapatkan jawaban.";
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

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus obrolan ini?")) return;
    
    try {
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
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]" />
      </div>

      <Navbar currentPage="tanya-hukum" />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-14 lg:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Badge className="bg-white/20 text-white hover:bg-white/30 px-6 py-2 text-sm font-semibold border border-white/30 shadow-sm backdrop-blur-sm">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Layanan Informasi Hukum Desa
            </Badge>
          </div>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-hero font-black text-white mb-4 leading-tight">
            Konsultasi Hukum AI
          </h1>
          <p className="text-subtitle text-emerald-50 mb-8 max-w-2xl mx-auto">
            Dapatkan informasi hukum dan prosedur administrasi desa dengan bantuan AI assistant. Cepat, akurat, dan gratis.
          </p>

          {/* Quota pill */}
          {quota !== null && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2.5">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">
                Sisa kuota: <strong>{quota}</strong> / {maxQuota} pertanyaan hari ini
              </span>
            </div>
          )}
        </div>
      </section>

      {/* MAIN */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 hidden md:flex items-start gap-6">
        
        {/* Sidebar - Desktop */}
        <div className="w-80 shrink-0">
          <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl dark:bg-gray-800 h-[calc(100vh-16rem)] flex flex-col sticky top-24">
            <CardHeader className="p-4 border-b border-emerald-100 dark:border-gray-700 bg-emerald-50/50 dark:bg-gray-800/50">
              <Button onClick={handleNewChat} className="w-full justify-start gap-2 bg-white hover:bg-emerald-50 text-emerald-700 border-2 border-emerald-200 dark:bg-gray-700 dark:text-emerald-400 dark:border-emerald-800/50 dark:hover:bg-gray-600 transition-all font-semibold shadow-sm">
                <Plus className="w-4 h-4" />
                Obrolan Baru
              </Button>
            </CardHeader>
            <CardContent className="p-2 flex-grow overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">Belum ada riwayat</p>
                ) : (
                  sessions.map((session) => (
                    <div 
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        activeSessionId === session.id 
                          ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800" 
                          : "hover:bg-emerald-50 dark:hover:bg-gray-700 border-transparent"
                      } border`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`} />
                        <div className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                          {session.title}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => handleDeleteSession(session.id, e)}
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

        {/* Chat Area & Recommendations (stacked horizontally on desktop) */}
        <div className="flex-1 w-full max-w-4xl min-w-0 flex flex-col gap-6">
          <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-2xl dark:bg-gray-800 flex flex-col h-[600px]">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700 py-4 px-6 shrink-0">
              <div className="flex items-center justify-between">
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
                {/* Usage counter badge */}
                {usedQuota !== null && (
                  <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${
                    quota === 0
                      ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                      : quota !== null && quota <= 3
                      ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
                  }`}>
                    <MessageSquare className="w-3 h-3" />
                    {usedQuota}/{maxQuota} digunakan
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref={chatContainerRef}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                      <Scale className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada percakapan</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Ajukan pertanyaan hukum atau pilih contoh di bawah</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "bot" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm"
                            : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                        }`}>
                          {msg.role === "bot" ? (
                            <p
                              className="whitespace-pre-line [&_strong]:text-emerald-700 dark:[&_strong]:text-emerald-400 [&_strong]:font-semibold"
                              dangerouslySetInnerHTML={{
                                __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
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
                              <span key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">AI sedang berpikir...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input Area Sticky Bottom */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-emerald-100 dark:border-gray-700 shrink-0">
                {/* Disclaimer */}
                {messages.length > 0 && (
                  <div className="flex gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/40 px-4 py-2.5 mb-3">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                      Informasi ini bersifat umum dan tidak menggantikan konsultasi profesional.
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-2 relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pertanyaan Anda</label>
                    {/* Mobile usage counter in desktop view hidden normally but useful */}
                    {usedQuota !== null && (
                      <span className={`sm:hidden text-xs font-bold ${quota === 0 ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
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
                          handleSubmit();
                        }
                      }}
                    />
                    <Button
                      type="submit"
                      disabled={loading || !question.trim() || quota === 0}
                      className="h-12 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg mb-0.5"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                  {quota === 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold">
                      Kuota harian Anda habis ({maxQuota} pertanyaan). {!user && "Login untuk kuota lebih banyak."}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Tekan Enter untuk mengirim · Shift+Enter untuk baris baru</p>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Example questions */}
          <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
                  Contoh Pertanyaan
                </CardTitle>
              </div>
              <CardDescription className="text-gray-500 dark:text-gray-400">
                Klik salah satu untuk langsung mengirim ke AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exampleQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => handleSubmit(undefined, q)}
                    disabled={loading || quota === 0}
                    className="group w-full h-auto py-4 px-5 border-2 border-emerald-100 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-emerald-800 dark:hover:text-emerald-400 font-normal text-sm text-left justify-start leading-snug transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer whitespace-normal break-words overflow-hidden"
                  >
                    <ChevronRight className="w-4 h-4 text-emerald-500 dark:text-emerald-400 mr-2.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    <span className="break-words">{q}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Sticky CTA or simple layout - Reusing same main concepts as desktop but stacking */}
      <div className="block md:hidden max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 space-y-4">
        {/* Mobile Header with Menu Button */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Riwayat Obrolan</h2>
          <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? "Tutup" : "Lihat Obrolan"}
          </Button>
        </div>

        {/* Mobile Sidebar (Collapsible) */}
        {isSidebarOpen && (
          <Card className="border border-emerald-100 dark:border-gray-700 mb-4 bg-white dark:bg-gray-800 shadow-md">
            <CardHeader className="p-3 border-b border-gray-100 dark:border-gray-700">
              <Button onClick={handleNewChat} className="w-full justify-start gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-gray-700 dark:text-emerald-400 dark:hover:bg-gray-600 transition-all font-semibold" size="sm">
                <Plus className="w-4 h-4" />
                Obrolan Baru
              </Button>
            </CardHeader>
            <CardContent className="p-2 max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {sessions.length === 0 ? (
                  <p className="text-center text-sm text-gray-500 py-4">Belum ada riwayat</p>
                ) : (
                  sessions.map((session) => (
                    <div 
                      key={session.id}
                      onClick={() => { setActiveSessionId(session.id); setIsSidebarOpen(false); }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
                        activeSessionId === session.id 
                          ? "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-200 dark:border-emerald-800" 
                          : "hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent"
                      } border`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate text-sm font-medium dark:text-gray-200">{session.title}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mobile Chat Card (Matches desktop Chat Area essentially) */}
        <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl dark:bg-gray-800 flex flex-col h-[600px]">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700 py-3 px-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">
                  Asisten Hukum AI
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-3">
                    <Scale className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Belum ada percakapan</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.role === "bot" && (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm"
                          : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                      }`}>
                        {msg.role === "bot" ? (
                          <p
                            className="whitespace-pre-line overflow-hidden"
                            dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }}
                          />
                        ) : (
                          <p className="whitespace-pre-line">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-2 justify-start">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center shadow-sm">
                        <span className="text-xs text-gray-400">Mengetik...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Input Area */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/80 border-t border-emerald-100 dark:border-gray-700 shrink-0">
              <form onSubmit={handleSubmit} className="relative">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ketik pertanyaan hukum desa di sini..."
                  className="w-full resize-none pr-12 rounded-xl border-gray-200 dark:border-gray-600 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white pb-3 min-h-[50px] text-sm"
                  rows={1}
                  disabled={loading || quota === 0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-2 bottom-2 h-8 w-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm"
                  disabled={!question.trim() || loading || quota === 0}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
