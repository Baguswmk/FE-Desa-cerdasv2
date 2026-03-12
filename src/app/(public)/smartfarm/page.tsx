"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Sprout,
  CloudRain,
  Droplets,
  Wind,
  Calendar,
  AlertTriangle,
  Sparkles,
  Leaf,
  Bug,
  Zap,
  Send,
  Loader2,
  Bot,
  User,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPinOff,
  MessageCircle,
  Plus,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { smartFarmService } from "@/services/smartfarm.service";
import { useAuth } from "@/hooks/useAuth";
import ConfirmModal from "@/components/ConfirmModal";

// ─── BMKG Data Wilayah Pringsewu ──────────────────────────────────────────────
// Sumber: BMKG Open Data (https://api.bmkg.go.id)
const WILAYAH_DATA = [
  { kecamatan: "Pringsewu", desa: "Fajaresuk", kode: "18.10.01.1001" },
  { kecamatan: "Pringsewu", desa: "Pringsewu Utara", kode: "18.10.01.1002" },
  { kecamatan: "Pringsewu", desa: "Pringsewu Selatan", kode: "18.10.01.1003" },
  { kecamatan: "Pringsewu", desa: "Pringsewu Barat", kode: "18.10.01.1004" },
  { kecamatan: "Pringsewu", desa: "Pringsewu Timur", kode: "18.10.01.1005" },
  { kecamatan: "Pringsewu", desa: "Margakaya", kode: "18.10.01.2006" },
  { kecamatan: "Pringsewu", desa: "Waluyojati", kode: "18.10.01.2007" },
  { kecamatan: "Pringsewu", desa: "Sidoharjo", kode: "18.10.01.2008" },
  { kecamatan: "Pringsewu", desa: "Podomoro", kode: "18.10.01.2009" },
  { kecamatan: "Pringsewu", desa: "Bumiarum", kode: "18.10.01.2010" },
  { kecamatan: "Pringsewu", desa: "Fajar Agung", kode: "18.10.01.2011" },
  { kecamatan: "Pringsewu", desa: "Rejosari", kode: "18.10.01.2012" },
  { kecamatan: "Pringsewu", desa: "Bumiayu", kode: "18.10.01.2013" },
  { kecamatan: "Pringsewu", desa: "Podosari", kode: "18.10.01.2014" },
  { kecamatan: "Pringsewu", desa: "Fajar Agung Barat", kode: "18.10.01.2015" },
  { kecamatan: "Gading Rejo", desa: "Blitarejo", kode: "18.10.02.2001" },
  { kecamatan: "Gading Rejo", desa: "Bulukarto", kode: "18.10.02.2002" },
  { kecamatan: "Gading Rejo", desa: "Bulurejo", kode: "18.10.02.2003" },
  { kecamatan: "Gading Rejo", desa: "Gadingrejo", kode: "18.10.02.2004" },
  { kecamatan: "Gading Rejo", desa: "Gadingrejo Timur", kode: "18.10.02.2005" },
  { kecamatan: "Gading Rejo", desa: "Gadingrejo Utara", kode: "18.10.02.2006" },
  { kecamatan: "Gading Rejo", desa: "Kediri", kode: "18.10.02.2007" },
  { kecamatan: "Gading Rejo", desa: "Klaten", kode: "18.10.02.2008" },
  { kecamatan: "Gading Rejo", desa: "Mataram", kode: "18.10.02.2009" },
  { kecamatan: "Gading Rejo", desa: "Panjerejo", kode: "18.10.02.2010" },
  { kecamatan: "Gading Rejo", desa: "Parerejo", kode: "18.10.02.2011" },
  { kecamatan: "Gading Rejo", desa: "Tambahrejo", kode: "18.10.02.2012" },
  { kecamatan: "Gading Rejo", desa: "Tambahrejo Barat", kode: "18.10.02.2013" },
  { kecamatan: "Gading Rejo", desa: "Tegalsari", kode: "18.10.02.2014" },
  { kecamatan: "Gading Rejo", desa: "Tulungagung", kode: "18.10.02.2015" },
  { kecamatan: "Gading Rejo", desa: "Wates", kode: "18.10.02.2016" },
  { kecamatan: "Gading Rejo", desa: "Wates Selatan", kode: "18.10.02.2017" },
  { kecamatan: "Gading Rejo", desa: "Wates Timur", kode: "18.10.02.2018" },
  { kecamatan: "Gading Rejo", desa: "Wonodadi", kode: "18.10.02.2019" },
  { kecamatan: "Gading Rejo", desa: "Wonodadi Utara", kode: "18.10.02.2020" },
  { kecamatan: "Gading Rejo", desa: "Wonosari", kode: "18.10.02.2021" },
  { kecamatan: "Gading Rejo", desa: "Yogyakarta", kode: "18.10.02.2022" },
  {
    kecamatan: "Gading Rejo",
    desa: "Yogyakarta Selatan",
    kode: "18.10.02.2023",
  },
  { kecamatan: "Ambarawa", desa: "Ambarawa", kode: "18.10.03.2001" },
  { kecamatan: "Ambarawa", desa: "Ambarawa Barat", kode: "18.10.03.2002" },
  { kecamatan: "Ambarawa", desa: "Ambarawa Timur", kode: "18.10.03.2003" },
  { kecamatan: "Ambarawa", desa: "Jatiagung", kode: "18.10.03.2004" },
  { kecamatan: "Ambarawa", desa: "Kresnomulyo", kode: "18.10.03.2005" },
  { kecamatan: "Ambarawa", desa: "Kresnomulyo Barat", kode: "18.10.03.2006" },
  { kecamatan: "Ambarawa", desa: "Margodadi", kode: "18.10.03.2007" },
  { kecamatan: "Ambarawa", desa: "Sumber Agung", kode: "18.10.03.2008" },
  { kecamatan: "Ambarawa", desa: "Tanjunganom", kode: "18.10.03.2009" },
  { kecamatan: "Pardasuka", desa: "Kedaung", kode: "18.10.04.2001" },
  { kecamatan: "Pardasuka", desa: "Pardasuka", kode: "18.10.04.2002" },
  { kecamatan: "Pardasuka", desa: "Pardasuka Selatan", kode: "18.10.04.2003" },
  { kecamatan: "Pardasuka", desa: "Pardasuka Timur", kode: "18.10.04.2004" },
  { kecamatan: "Pardasuka", desa: "Pujodadi", kode: "18.10.04.2005" },
  { kecamatan: "Pardasuka", desa: "Rantau Tijang", kode: "18.10.04.2006" },
  { kecamatan: "Pardasuka", desa: "Selapan", kode: "18.10.04.2007" },
  { kecamatan: "Pardasuka", desa: "Sidodadi", kode: "18.10.04.2008" },
  { kecamatan: "Pardasuka", desa: "Suka Negeri", kode: "18.10.04.2009" },
  { kecamatan: "Pardasuka", desa: "Sukorejo", kode: "18.10.04.2010" },
  { kecamatan: "Pardasuka", desa: "Tanjung Rusia", kode: "18.10.04.2011" },
  {
    kecamatan: "Pardasuka",
    desa: "Tanjung Rusia Timur",
    kode: "18.10.04.2012",
  },
  { kecamatan: "Pardasuka", desa: "Warga Mulyo", kode: "18.10.04.2013" },
] as const;

type WilayahEntry = (typeof WILAYAH_DATA)[number];

const KECAMATAN_LIST = [...new Set(WILAYAH_DATA.map((w) => w.kecamatan))];

// ─── BMKG Response shape ───────────────────────────────────────────────────────
interface BmkgForecast {
  datetime: string;
  local_datetime: string;
  t: number; // suhu °C
  hu: number; // kelembaban %
  ws: number; // kecepatan angin m/s
  wd: string; // arah angin
  tp: number; // curah hujan mm
  weather_desc: string;
  image: string; // icon SVG URL
  vs_text: string; // jarak pandang
}

interface BmkgResponse {
  lokasi: { desa: string; kecamatan: string; provinsi: string };
  data: Array<{ cuaca: BmkgForecast[][] }>;
}

type Message = { role: "user" | "bot"; text: string };
type Session = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
};

export default function SmartFarmPage() {
  type CropKey = "padi" | "jagung" | "cabai" | "tomat" | "sayuran";
  const [selectedCrop, setSelectedCrop] = useState<CropKey>("padi");

  // ── BMKG state ──────────────────────────────────────────────────────────────
  const [selectedKecamatan, setSelectedKecamatan] =
    useState<string>("Pringsewu");
  const [selectedDesa, setSelectedDesa] = useState<string>("18.10.01.1004"); // kode wilayah
  const [bmkgData, setBmkgData] = useState<BmkgResponse | null>(null);
  const [bmkgLoading, setBmkgLoading] = useState(false);
  const [bmkgError, setBmkgError] = useState<string | null>(null);
  const [isBmkgExpanded, setIsBmkgExpanded] = useState(false);

  const desaList = WILAYAH_DATA.filter(
    (w) => w.kecamatan === selectedKecamatan,
  );

  // Auto-select first desa when kecamatan changes
  const handleKecamatanChange = (kec: string) => {
    setSelectedKecamatan(kec);
    const firstDesa = WILAYAH_DATA.find((w) => w.kecamatan === kec);
    if (firstDesa) setSelectedDesa(firstDesa.kode);
    setBmkgData(null);
  };

  // Fetch BMKG on desa change
  useEffect(() => {
    if (!selectedDesa) return;
    fetchBmkg();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDesa]);

  const fetchBmkg = async () => {
    setBmkgLoading(true);
    setBmkgError(null);
    try {
      const res = await fetch(
        `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${selectedDesa}`,
      );
      if (!res.ok) throw new Error("Gagal memuat data BMKG");
      const json: BmkgResponse = await res.json();
      setBmkgData(json);
    } catch (e: unknown) {
      setBmkgError(e instanceof Error ? e.message : "Gagal memuat data cuaca");
    } finally {
      setBmkgLoading(false);
    }
  };

  // Get today's first forecast entry
  const todayForecasts: BmkgForecast[] = bmkgData?.data?.[0]?.cuaca?.[0] ?? [];
  const currentForecast: BmkgForecast | undefined = todayForecasts[0];
  // All forecasts flattened for 3-day view (first 3 day-groups)
  const next3Days = bmkgData?.data?.[0]?.cuaca?.slice(0, 3) ?? [];

  const selectedDesaEntry: WilayahEntry | undefined = WILAYAH_DATA.find(
    (w) => w.kode === selectedDesa,
  );

  // Farm Chat AI & Location
  const { user } = useAuth();
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; sessionId: string | null }>({
    isOpen: false,
    sessionId: null,
  });
  
  // Location detection
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  // Quota counter
  const [quota, setQuota] = useState<number | null>(null);
  const maxQuota = user ? 50 : 10;
  const usedQuota = quota !== null ? maxQuota - quota : null;

  // Auto-scroll to bottom when messages change — only inside the chat container
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chatMessages, activeSessionId]);

  // Auto-focus chat input ref
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load quota on mount
    smartFarmService.getFarmChatQuota()
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
        // Group by session_id
        const grouped: Record<string, Session> = {};
        
        [...history.data].reverse().forEach((msg: any) => {
          const sid = msg.session_id || "null";
          if (!grouped[sid]) {
            grouped[sid] = {
              id: sid,
              title: msg.question.substring(0, 30) + (msg.question.length > 30 ? "..." : ""),
              messages: [],
              createdAt: msg.created_at,
            };
          }
          grouped[sid].messages.push({ role: "user", text: msg.question });
          grouped[sid].messages.push({ role: "bot", text: msg.answer });
        });

        const sessionList = Object.values(grouped).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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

  // Update visible messages when activeSessionId changes
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
      alert("Browser Anda tidak mendukung deteksi lokasi.");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationEnabled(true);
        setLocationLoading(false);
      },
      (error) => {
        console.error("Error getting location", error);
        alert("Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.");
        setLocationEnabled(false);
        setUserLocation(null);
        setLocationLoading(false);
      }
    );
  };

  const handleAskFarm = async (promptOverride?: string) => {
    const question = (promptOverride || chatQuestion).trim();
    if (!question || chatLoading) return;
    if (quota === 0) {
      setChatMessages((prev) => [...prev, { role: "bot", text: `⚠️ Kuota harian Anda sudah habis (${maxQuota} pertanyaan).${!user ? " Login untuk kuota lebih banyak (50/hari)." : ""}` }]);
      return;
    }
    
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatQuestion("");
    // Return focus to input immediately after clearing
    setTimeout(() => chatInputRef.current?.focus(), 0);
    setChatLoading(true);
    try {
      const response = await smartFarmService.askFarmQuestion(
        question, 
        activeSessionId || undefined,
        userLocation?.lat, 
        userLocation?.lng
      );
      const answer =
        response.data?.answer ||
        response.data?.data?.answer ||
        "Maaf, tidak ada jawaban.";
      
      const newSessionId = response.data?.session_id || response.data?.data?.session_id;
      const remQuota = response.data?.remaining_quota ?? response.data?.data?.remaining_quota;
      if (remQuota !== undefined) setQuota(remQuota);

      if (!activeSessionId && newSessionId) {
        setActiveSessionId(newSessionId);
        loadChatHistory();
      } else {
        setChatMessages((prev) => [...prev, { role: "bot", text: answer }]);
        setSessions(prevSessions => prevSessions.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...s.messages, { role: "user", text: question }, { role: "bot", text: answer }]
            };
          }
          return s;
        }));
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
      alert("Gagal menghapus obrolan");
    }
  };

  const crops: { id: CropKey; name: string; icon: string }[] = [
    { id: "padi", name: "Padi", icon: "🌾" },
    { id: "jagung", name: "Jagung", icon: "🌽" },
    { id: "cabai", name: "Cabai", icon: "🌶️" },
    { id: "tomat", name: "Tomat", icon: "🍅" },
    { id: "sayuran", name: "Sayuran", icon: "🥬" },
  ];

  const cropTips = {
    padi: {
      watering: "Genangan air 5-10 cm selama fase vegetatif",
      fertilizer: "Urea 200 kg/ha, SP-36 100 kg/ha, KCl 100 kg/ha",
      pestControl: "Pantau hama wereng dan tikus secara rutin",
      harvest: "Panen saat 85-90% bulir menguning (±110-120 hari)",
    },
    jagung: {
      watering: "Penyiraman teratur, hindari genangan air",
      fertilizer: "Urea 300 kg/ha, SP-36 150 kg/ha, KCl 100 kg/ha",
      pestControl: "Waspadai ulat tongkol dan belalang",
      harvest: "Panen saat rambut jagung mengering (±90-100 hari)",
    },
    cabai: {
      watering: "Siram pagi dan sore, jaga kelembaban tanah",
      fertilizer: "Pupuk kandang 20 ton/ha + NPK sesuai fase",
      pestControl: "Kontrol hama thrips dan kutu daun",
      harvest: "Panen bertahap saat buah berwarna merah",
    },
    tomat: {
      watering: "Siram teratur, hindari membasahi daun",
      fertilizer: "Pupuk kandang + NPK 15:15:15",
      pestControl: "Cegah busuk buah dan hama ulat",
      harvest: "Panen saat buah berwarna merah keunguan",
    },
    sayuran: {
      watering: "Penyiraman rutin pagi dan sore hari",
      fertilizer: "Pupuk organik + NPK seimbang",
      pestControl: "Gunakan pestisida organik",
      harvest: "Sesuai jenis sayuran (20-60 hari)",
    },
  };

  const features = [
    {
      icon: CloudRain,
      title: "Prediksi Cuaca",
      description:
        "Data cuaca real-time dari BMKG dan prediksi 3 hari ke depan",
    },
    {
      icon: Leaf,
      title: "Panduan Budidaya",
      description: "Panduan lengkap perawatan tanaman dari awal hingga panen",
    },
    {
      icon: Bug,
      title: "Deteksi Hama AI",
      description: "Identifikasi hama dan penyakit tanaman dengan AI",
    },
    {
      icon: Calendar,
      title: "Jadwal Tanam",
      description: "Reminder otomatis untuk pemupukan dan perawatan",
    },
  ];

  // ── Helper: format local_datetime "YYYY-MM-DD HH:mm:ss" → jam lokal
  const formatJam = (ldt: string) => {
    const d = new Date(ldt.replace(" ", "T"));
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTanggal = (ldt: string) => {
    const d = new Date(ldt.replace(" ", "T"));
    return d.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      {/* Navbar */}
      <Navbar currentPage="smartfarm" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 py-16 animate-fade-in">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6 animate-float">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-hero font-black text-white mb-4 animate-fade-in-up animation-delay-200">
            Smart Farm AI
          </h1>
          <p className="text-subtitle text-emerald-50 mb-6 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
            Platform pertanian cerdas berbasis AI untuk membantu petani desa
            meningkatkan hasil panen
          </p>
          <Badge className="bg-white/20 text-white backdrop-blur-sm border border-white/30 px-6 py-2 text-sm font-semibold animate-fade-in-up animation-delay-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Artificial Intelligence
          </Badge>
        </div>
      </section>

      {/* ── BMKG Weather Widget ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-2xl animate-fade-in-up animation-delay-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-black text-gray-900 dark:text-gray-100">
                  <CloudRain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  Prakiraan Cuaca BMKG
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1 dark:text-gray-400">
                  <span>Data dari</span>
                  <a
                    href="https://www.bmkg.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {bmkgData && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsBmkgExpanded(true);
                      fetchBmkg();
                    }}
                    disabled={bmkgLoading}
                    className="border-2 border-emerald-200 dark:border-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 font-semibold h-9"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${bmkgLoading ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">Perbarui</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBmkgExpanded(!isBmkgExpanded)}
                  className="border-2 border-emerald-200 dark:border-gray-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 h-9 w-9 p-0"
                >
                  {isBmkgExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Kecamatan + Desa Selector (Only show if expanded) */}
            <div className={`flex flex-col sm:flex-row gap-3 mt-4 transition-all duration-300 opacity-100 h-auto`}>
              <div className="flex-1">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Kecamatan
                </label>
                <Select
                  value={selectedKecamatan}
                  onValueChange={handleKecamatanChange}
                >
                  <SelectTrigger className="h-11 border-2 border-emerald-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-emerald-500 bg-white font-semibold flex items-center justify-between px-3 relative">
                    <SelectValue placeholder="Pilih kecamatan" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700 z-[100]">
                    {KECAMATAN_LIST.map((kec) => (
                      <SelectItem key={kec} value={kec} className="dark:text-gray-200 dark:focus:bg-gray-700">
                        {kec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  Desa / Kelurahan
                </label>
                <Select value={selectedDesa} onValueChange={setSelectedDesa}>
                  <SelectTrigger className="h-11 border-2 border-emerald-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-emerald-500 bg-white font-semibold flex items-center justify-between px-3 relative">
                    <SelectValue placeholder="Pilih desa" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700 z-[100]">
                    {desaList.map((w) => (
                      <SelectItem key={w.kode} value={w.kode} className="dark:text-gray-200 dark:focus:bg-gray-700">
                        {w.desa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

            <CardContent className="p-6">
              {/* Loading */}
            {bmkgLoading && (
              <div className="flex items-center justify-center py-10 gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
                <span className="text-gray-600 dark:text-gray-400 font-semibold">
                  Mengambil data dari BMKG...
                </span>
              </div>
            )}

            {/* Error */}
            {bmkgError && !bmkgLoading && (
              <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-red-800 dark:text-red-400 text-sm">{bmkgError}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchBmkg}
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40 border-2"
                >
                  Coba lagi
                </Button>
              </div>
            )}

            {/* Data */}
            {bmkgData && !bmkgLoading && (
              <div className="space-y-6">
                {/* Lokasi badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold px-3 py-1">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {selectedDesaEntry?.desa}, Kec.{" "}
                      {selectedDesaEntry?.kecamatan}
                    </Badge>
                  </div>
                </div>

                {/* Current / closest forecast (ALWAYS VISIBLE) */}
                {currentForecast && (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentForecast.image}
                          alt={currentForecast.weather_desc}
                          className="w-16 h-16 object-contain drop-shadow"
                          onError={(e) =>
                            (e.currentTarget.style.display = "none")
                          }
                        />
                        <div>
                          <p className="text-4xl font-black">
                            {currentForecast.t}°C
                          </p>
                          <p className="text-emerald-50 font-semibold text-sm">
                            {currentForecast.weather_desc}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 bg-white/10 rounded-xl p-3 w-full sm:w-auto overflow-x-auto custom-scrollbar">
                        <div className="text-center min-w-[60px]">
                          <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                          <p className="font-bold text-sm">{currentForecast.hu}%</p>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="text-center min-w-[70px]">
                          <CloudRain className="w-4 h-4 mx-auto mb-1 text-cyan-200" />
                          <p className="font-bold text-sm">{currentForecast.tp} mm</p>
                        </div>
                        <div className="w-px h-8 bg-white/20"></div>
                        <div className="text-center min-w-[60px]">
                          <Wind className="w-4 h-4 mx-auto mb-1 text-gray-200" />
                          <p className="font-bold text-sm">{currentForecast.ws} m/s</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* COLLAPSIBLE SECTION (3-day forecast details) */}
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    isBmkgExpanded ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0 overflow-hidden mt-0"
                  }`}
                >

                {/* 3-day hourly forecast */}
                {next3Days.length > 0 && (
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-gray-100 text-base mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Prakiraan 3 Hari ke Depan
                    </h3>
                    <div className="space-y-3">
                      {next3Days.map((dayForecast, dayIdx) => {
                        const firstEntry = dayForecast[0];
                        if (!firstEntry) return null;
                        return (
                          <div
                            key={dayIdx}
                            className="border-2 border-emerald-100 dark:border-gray-700 rounded-xl overflow-hidden"
                          >
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 border-b border-emerald-100 dark:border-gray-700">
                              <p className="text-sm font-black text-emerald-800 dark:text-emerald-400">
                                {formatTanggal(firstEntry.local_datetime)}
                              </p>
                            </div>
                            <div className="overflow-x-auto">
                              <div className="flex gap-0 min-w-max">
                                {dayForecast.map((f, idx) => (
                                  <div
                                    key={idx}
                                    className="flex-shrink-0 w-28 p-3 text-center border-r border-gray-100 dark:border-gray-700 last:border-r-0 hover:bg-emerald-50/50 dark:hover:bg-gray-700/50 transition-colors"
                                  >
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">
                                      {formatJam(f.local_datetime)}
                                    </p>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={f.image}
                                      alt={f.weather_desc}
                                      className="w-8 h-8 mx-auto object-contain"
                                      onError={(e) =>
                                        (e.currentTarget.style.display = "none")
                                      }
                                    />
                                    <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-1">
                                      {f.t}°C
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">
                                      {f.weather_desc}
                                    </p>
                                    <div className="mt-1.5 flex flex-col gap-0.5">
                                      <span className="text-xs text-blue-500 font-semibold">
                                        💧 {f.hu}%
                                      </span>
                                      {f.tp > 0 && (
                                        <span className="text-xs text-cyan-600 font-semibold">
                                          🌧 {f.tp} mm
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* END COLLAPSIBLE SECTION */}
                </div>

                {/* BMKG attribution */}
                <p className="text-xs text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">
                  ⓘ Data prakiraan cuaca bersumber dari{" "}
                  <a
                    href="https://www.bmkg.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                  >
                    BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)
                  </a>{" "}
                  melalui API publik. Diperbarui setiap beberapa jam.
                </p>
              </div>
            )}

            {/* Initial state — no data yet */}
            {!bmkgData && !bmkgLoading && !bmkgError && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CloudRain className="w-12 h-12 text-emerald-400 dark:text-emerald-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Pilih kecamatan dan desa di atas untuk melihat prakiraan
                  cuaca.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="space-y-8">
          {/* Crop Selection */}
          <div className="animate-fade-in-up animation-delay-400">
            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6">
              Pilih Jenis Tanaman
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {crops.map((crop) => (
                <Button
                  key={crop.id}
                  variant={selectedCrop === crop.id ? "default" : "outline"}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`h-24 flex-col gap-2 cursor-pointer transition-all ${
                    selectedCrop === crop.id
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold border-0"
                      : "border-2 border-emerald-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-800 text-emerald-700 dark:text-emerald-400 font-semibold bg-white dark:bg-gray-800"
                  }`}
                >
                  <span className="text-4xl">{crop.icon}</span>
                  <span>{crop.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Crop Tips */}
          <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-2xl animate-fade-in-up animation-delay-500">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700">
              <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
                Panduan Budidaya{" "}
                {crops.find((c) => c.id === selectedCrop)?.name}
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Tips dan trik untuk hasil panen maksimal
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Penyiraman
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {cropTips[selectedCrop].watering}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Pemupukan
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {cropTips[selectedCrop].fertilizer}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bug className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Pengendalian Hama
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {cropTips[selectedCrop].pestControl}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">
                        Waktu Panen
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {cropTips[selectedCrop].harvest}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Farm Chat Layout (Sidebar + Chat Area) ── */}
          <div className="flex flex-col md:flex-row items-start gap-6 animate-fade-in-up animation-delay-550">
            {/* Sidebar - Desktop */}
            <div className="w-full md:w-80 shrink-0 hidden md:block">
              <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl dark:bg-gray-800 h-[700px] flex flex-col sticky top-24">
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

            {/* Mobile Sidebar Trigger & List (Stacked above chat on small screens) */}
            <div className="block md:hidden w-full mb-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Riwayat Obrolan</h2>
                <Button variant="outline" size="sm" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                  {isSidebarOpen ? "Tutup" : "Lihat Obrolan"}
                </Button>
              </div>

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
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
                        Tanya AI Pertanian
                      </CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        Tanyakan panduan budidaya, hama, hingga rekomendasi.
                      </CardDescription>
                    </div>
                  </div>
                  {/* Usage badge */}
                  {usedQuota !== null && (
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 shrink-0 ${
                      quota === 0
                        ? "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
                        : quota !== null && quota <= 3
                        ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-400"
                        : "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400"
                    }`}>
                      <MessageCircle className="w-3 h-3" />
                      {usedQuota}/{maxQuota} digunakan
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                        <Sprout className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Konsultasi Pertanian Anda</p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Ajukan pertanyaan atau pilih rekomendasi di bawah ini untuk memulai pencatatan riwayat konsultasi.</p>
                    </div>
                  ) : (
                    <>
                      {chatMessages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          {msg.role === "bot" && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div
                            className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                              msg.role === "user"
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-sm"
                                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm shadow-sm"
                            }`}
                          >
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
                      {chatLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-sm">
                            <div className="flex gap-1">
                              {[0, 1, 2].map((i) => (
                                <span key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Sedang berpikir...</span>
                          </div>
                        </div>
                      )}

                    </>
                  )}
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-emerald-100 dark:border-gray-700 shrink-0">
                  <div className="flex flex-col gap-3">
                    {/* Prompt suggestions mapping */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAskFarm("Tanaman apa yang cocok ditanam sekarang melihat kondisi cuaca saat ini?")}
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-gray-700 dark:text-emerald-400 dark:hover:bg-gray-800 text-xs rounded-full bg-white dark:bg-gray-800"
                      >
                        <Leaf className="w-3 h-3 mr-1" /> Rekomendasi Tanam
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAskFarm("Bagaimana cara membuat pupuk organik cair di rumah?")}
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-gray-700 dark:text-emerald-400 dark:hover:bg-gray-800 text-xs rounded-full bg-white dark:bg-gray-800"
                      >
                        <Sprout className="w-3 h-3 mr-1" /> Buat Pupuk Organik
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAskFarm("Beri saya jadwal perawatan untuk menanam padi lokal.")}
                        className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-gray-700 dark:text-emerald-400 dark:hover:bg-gray-800 text-xs rounded-full bg-white dark:bg-gray-800"
                      >
                        <Calendar className="w-3 h-3 mr-1" /> Jadwal Perawatan Padi
                      </Button>
                    </div>
                    
                    <div className="flex gap-3 items-end">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pesan Anda</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={locationEnabled ? () => { setLocationEnabled(false); setUserLocation(null); } : handleGetLocation}
                            className={`h-7 px-2 text-xs font-semibold ${
                              locationEnabled 
                                ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            }`}
                          >
                            {locationLoading ? (
                              <><Loader2 className="w-3 h-3 mr-1 pos-left animate-spin" /> Mengambil lokasi...</>
                            ) : locationEnabled ? (
                              <><MapPin className="w-3 h-3 mr-1" /> Lokasi Aktif</>
                            ) : (
                              <><MapPinOff className="w-3 h-3 mr-1" /> Deteksi Lokasi untuk Saran Akurat</>
                            )}
                          </Button>
                        </div>
                        <Textarea
                          ref={chatInputRef}
                          value={chatQuestion}
                          onChange={(e) => setChatQuestion(e.target.value)}
                          placeholder="Ketik pertanyaan Anda di sini..."
                          className="flex-1 border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:ring-emerald-500 resize-none min-h-[48px] max-h-[120px] rounded-xl"
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
                        className="h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 shadow-lg rounded-xl mb-0.5"
                      >
                        {chatLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5 ml-0.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {quota === 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-2">
                      Kuota harian Anda habis ({maxQuota} pertanyaan). {!user && "Login untuk kuota lebih banyak."}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Tekan Enter untuk mengirim · Shift+Enter untuk baris baru
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features */}
          {/* <div className="animate-fade-in-up animation-delay-600">
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              Fitur Smart Farm
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="border-2 border-emerald-100 hover:border-emerald-300 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
                        <Icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div> */}
        </div>
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
