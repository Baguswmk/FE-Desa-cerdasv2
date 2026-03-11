"use client";

import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sprout,
  CloudRain,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Calendar,
  AlertTriangle,
  Sparkles,
  Leaf,
  Bug,
  Zap,
  MessageCircle,
  Send,
  Loader2,
  Bot,
  User,
  MapPin,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { smartFarmService } from "@/services/smartfarm.service";

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

  // Farm Chat AI
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "bot"; text: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleAskFarm = async () => {
    if (!chatQuestion.trim() || chatLoading) return;
    const question = chatQuestion.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: question }]);
    setChatQuestion("");
    setChatLoading(true);
    try {
      const response = await smartFarmService.askFarmQuestion(question);
      const answer =
        response.data?.answer ||
        response.data?.data?.answer ||
        "Maaf, tidak ada jawaban.";
      setChatMessages((prev) => [...prev, { role: "bot", text: answer }]);
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Gagal mendapatkan jawaban. Coba lagi nanti.";
      setChatMessages((prev) => [...prev, { role: "bot", text: msg }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ── AI Crop Recommendation ────────────────────────────────────────────────
  const [recPlantName, setRecPlantName] = useState("");
  const [recPlantDate, setRecPlantDate] = useState("");
  const [recResult, setRecResult] = useState("");
  const [recLoading, setRecLoading] = useState(false);

  const handleGenerateRecommendation = async () => {
    setRecLoading(true);
    setRecResult("");
    try {
      const locationStr = selectedDesaEntry
        ? `${selectedDesaEntry.desa}, Kec. ${selectedDesaEntry.kecamatan}`
        : "lokasi tersebut";
      let prompt = "";

      if (!recPlantName.trim()) {
        prompt = `SAYA INGIN REKOMENDASI TANAMAN: Di lokasi ${locationStr}, tanaman apa yang paling cocok untuk ditanam saat ini melihat kondisi cuacanya? Mohon berikan beberapa rekomendasi tanaman beserta alasannya secara terstruktur.`;
      } else {
        const dateStr = recPlantDate
          ? `pada tanggal ${recPlantDate}`
          : "dalam waktu dekat";
        prompt = `SAYA INGIN PANDUAN TANAM: Saya berencana menanam ${recPlantName} ${dateStr} di lokasi ${locationStr}. Tolong berikan panduan terstruktur meliputi:\n1. Tata cara penanaman\n2. Panduan perawatan & pantangan\n3. Perkiraan masa panen`;
      }

      const response = await smartFarmService.askFarmQuestion(prompt);
      const answer =
        response.data?.answer ||
        response.data?.data?.answer ||
        "Maaf, gagal membuat rekomendasi.";
      setRecResult(answer);
    } catch (error: unknown) {
      setRecResult("Gagal mendapatkan rekomendasi. Silakan coba lagi nanti.");
    } finally {
      setRecLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
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
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 animate-fade-in-up animation-delay-200">
            Smart Farm AI
          </h1>
          <p className="text-xl text-emerald-50 mb-6 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
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
        <Card className="border-2 border-emerald-100 shadow-2xl animate-fade-in-up animation-delay-300 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-black text-gray-900">
                  <CloudRain className="w-6 h-6 text-emerald-600" />
                  Prakiraan Cuaca BMKG
                </CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <span>Data dari</span>
                  <a
                    href="https://www.bmkg.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold hover:underline inline-flex items-center gap-1"
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
                    className="border-2 border-emerald-200 hover:bg-emerald-50 font-semibold h-9"
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
                  className="border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 h-9 w-9 p-0"
                >
                  {isBmkgExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Kecamatan + Desa Selector (Only show if expanded) */}
            <div className={`flex flex-col sm:flex-row gap-3 mt-4 transition-all duration-300 opacity-100 h-auto`}>
              <div className="flex-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Kecamatan
                </label>
                <Select
                  value={selectedKecamatan}
                  onValueChange={handleKecamatanChange}
                >
                  <SelectTrigger className="h-11 border-2 border-emerald-200 focus:border-emerald-500 bg-white font-semibold">
                    <SelectValue placeholder="Pilih kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {KECAMATAN_LIST.map((kec) => (
                      <SelectItem key={kec} value={kec}>
                        {kec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-xs font-black text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Desa / Kelurahan
                </label>
                <Select value={selectedDesa} onValueChange={setSelectedDesa}>
                  <SelectTrigger className="h-11 border-2 border-emerald-200 focus:border-emerald-500 bg-white font-semibold">
                    <SelectValue placeholder="Pilih desa" />
                  </SelectTrigger>
                  <SelectContent>
                    {desaList.map((w) => (
                      <SelectItem key={w.kode} value={w.kode}>
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
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-gray-600 font-semibold">
                  Mengambil data dari BMKG...
                </span>
              </div>
            )}

            {/* Error */}
            {bmkgError && !bmkgLoading && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-100 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold text-red-800 text-sm">{bmkgError}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchBmkg}
                  className="border-red-200 text-red-600 hover:bg-red-50"
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
                    <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold px-3 py-1">
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
                    <h3 className="font-black text-gray-900 text-base mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      Prakiraan 3 Hari ke Depan
                    </h3>
                    <div className="space-y-3">
                      {next3Days.map((dayForecast, dayIdx) => {
                        const firstEntry = dayForecast[0];
                        if (!firstEntry) return null;
                        return (
                          <div
                            key={dayIdx}
                            className="border-2 border-emerald-100 rounded-xl overflow-hidden"
                          >
                            <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100">
                              <p className="text-sm font-black text-emerald-800">
                                {formatTanggal(firstEntry.local_datetime)}
                              </p>
                            </div>
                            <div className="overflow-x-auto">
                              <div className="flex gap-0 min-w-max">
                                {dayForecast.map((f, idx) => (
                                  <div
                                    key={idx}
                                    className="flex-shrink-0 w-28 p-3 text-center border-r border-gray-100 last:border-r-0 hover:bg-emerald-50/50 transition-colors"
                                  >
                                    <p className="text-xs text-gray-500 font-semibold mb-1">
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
                                    <p className="text-base font-black text-gray-900 mt-1">
                                      {f.t}°C
                                    </p>
                                    <p className="text-xs text-gray-500 leading-tight mt-0.5">
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
                <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
                  ⓘ Data prakiraan cuaca bersumber dari{" "}
                  <a
                    href="https://www.bmkg.go.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 font-semibold hover:underline"
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
                <CloudRain className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="text-gray-600 font-medium">
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
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              Pilih Jenis Tanaman
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {crops.map((crop) => (
                <Button
                  key={crop.id}
                  variant={selectedCrop === crop.id ? "default" : "outline"}
                  onClick={() => setSelectedCrop(crop.id)}
                  className={`h-24 flex-col gap-2 cursor-pointer ${
                    selectedCrop === crop.id
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold"
                      : "border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 font-semibold"
                  }`}
                >
                  <span className="text-4xl">{crop.icon}</span>
                  <span>{crop.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Crop Tips */}
          <Card className="border-2 border-emerald-100 shadow-2xl animate-fade-in-up animation-delay-500">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="text-2xl font-black text-gray-900">
                Panduan Budidaya{" "}
                {crops.find((c) => c.id === selectedCrop)?.name}
              </CardTitle>
              <CardDescription>
                Tips dan trik untuk hasil panen maksimal
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Droplets className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        Penyiraman
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {cropTips[selectedCrop].watering}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        Pemupukan
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {cropTips[selectedCrop].fertilizer}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Bug className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        Pengendalian Hama
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {cropTips[selectedCrop].pestControl}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        Waktu Panen
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {cropTips[selectedCrop].harvest}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Crop Recommendation Generator */}
          <Card className="border-2 border-emerald-100 shadow-2xl animate-fade-in-up animation-delay-500 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-white">
                    Rekomendasi Tanam AI
                  </CardTitle>
                  <CardDescription className="text-emerald-50">
                    Masukkan tanaman dan tanggal, atau biarkan kosong untuk
                    mendapatkan rekomendasi tanaman terbaik di lokasimu
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Nama Tanaman <span className="text-gray-400 font-normal">(opsional)</span>
                  </Label>
                  <Input
                    placeholder="Contoh: Padi, Jagung, Cabai..."
                    value={recPlantName}
                    onChange={(e) => setRecPlantName(e.target.value)}
                    className="border-2 focus-visible:ring-emerald-500 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-700">
                    Tanggal Tanam <span className="text-gray-400 font-normal">(opsional)</span>
                  </Label>
                  <Input
                    type="date"
                    value={recPlantDate}
                    onChange={(e) => setRecPlantDate(e.target.value)}
                    className="border-2 focus-visible:ring-emerald-500 h-12"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between mb-8 py-4 border-y-2 border-emerald-50 border-dashed">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  Lokasi Terpilih: {selectedDesaEntry?.desa}, Kec.{" "}
                  {selectedDesaEntry?.kecamatan}
                </div>
                <Button
                  onClick={handleGenerateRecommendation}
                  disabled={recLoading}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold h-12 px-8 shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-0.5"
                >
                  {recLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Bot className="w-5 h-5 mr-2" />
                      Generate Rekomendasi
                    </>
                  )}
                </Button>
              </div>

              {/* Result Area */}
              {recResult && (
                <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 rounded-2xl p-6 shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-bl-full -z-10 blur-xl"></div>
                  <h3 className="text-lg font-black text-emerald-800 mb-4 flex items-center gap-2 border-b-2 border-emerald-100/50 pb-3">
                    <Leaf className="w-5 h-5" />
                    Hasil Analisis AI
                  </h3>
                  <div className="prose prose-emerald prose-sm max-w-none text-gray-700 prose-p:leading-relaxed prose-li:my-1">
                    <p className="whitespace-pre-line leading-relaxed text-sm">
                      {recResult}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Farm Chat AI */}
          <Card className="border-2 border-emerald-100 shadow-2xl animate-fade-in-up animation-delay-550">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-gray-900">
                    Tanya AI Pertanian
                  </CardTitle>
                  <CardDescription>
                    Tanyakan apapun tentang pertanian, peternakan, dan
                    pengelolaan lahan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {chatMessages.length > 0 && (
                <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto rounded-xl bg-gray-50 p-4 border border-gray-200">
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
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                            : "bg-white border border-gray-200 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>
                      {msg.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center shrink-0 mt-1">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                        <span className="text-sm text-gray-500">
                          Sedang berpikir...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3">
                <Textarea
                  value={chatQuestion}
                  onChange={(e) => setChatQuestion(e.target.value)}
                  placeholder="Contoh: Bagaimana cara mengatasi hama wereng pada tanaman padi?"
                  className="flex-1 border-2 focus:border-emerald-500 focus:ring-emerald-500 resize-none min-h-[48px] max-h-[120px]"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAskFarm();
                    }
                  }}
                  disabled={chatLoading}
                />
                <Button
                  onClick={handleAskFarm}
                  disabled={chatLoading || !chatQuestion.trim()}
                  className="h-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold px-6 shadow-lg"
                >
                  {chatLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tekan Enter untuk mengirim · Shift+Enter untuk baris baru
              </p>
            </CardContent>
          </Card>

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
    </div>
  );
}
