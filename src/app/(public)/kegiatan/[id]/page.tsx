"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  ArrowLeft,
  Home,
  Heart,
  Upload,
  CheckCircle2,
  Calendar,
  Shield,
  FileImage,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Clock,
  CreditCard,
  QrCode,
  Copy,
  Check,
  Activity,
  Receipt,
  Users,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { kegiatanService } from "@/services/kegiatan.service";
import { donasiService } from "@/services/donasi.service";
import { toast } from "sonner";
interface JadwalItem {
  tanggal: string;
  waktu: string;
  nama_kegiatan: string;
}

interface Kegiatan {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  banner: string | null;
  photos: string[];
  start_date: string;
  end_date: string | null;
  status: string;
  jadwal: JadwalItem[] | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
  qr_image: string | null;
  village_name: string | null;
  district: string | null;
  province: string | null;
  google_maps_link: string | null;
  donations: Array<{
    id: string;
    amount: number;
    donor_name: string | null;
    message: string | null;
    approved_at: string;
    user: { nama: string } | null;
  }>;
  activity_updates: Array<{
    id: string;
    title: string;
    description: string;
    photo: string | null;
    created_at: string;
  }>;
  expense_reports: Array<{
    id: string;
    title: string;
    amount: number;
    receipt_image: string | null;
    created_at: string;
  }>;
}

const getImageUrl = (photo: string) =>
  `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/uploads/${photo}`;

export default function KegiatanDetailPage() {
  const params = useParams();
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationForm, setDonationForm] = useState({ amount: "", donor_name: "", message: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedRek, setCopiedRek] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [qrLightboxOpen, setQrLightboxOpen] = useState(false);

  useEffect(() => {
    if (params.id) loadKegiatan(params.id as string);
  }, [params.id]);

  useEffect(() => {
    if (!lightboxOpen || !kegiatan) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i + 1) % kegiatan.photos.length);
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i - 1 + kegiatan.photos.length) % kegiatan.photos.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, kegiatan]);

  useEffect(() => {
    if (!qrLightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQrLightboxOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [qrLightboxOpen]);

  const loadKegiatan = async (id: string) => {
    try {
      const response = await kegiatanService.getById(id);
      setKegiatan(response.data.data ?? response.data);
    } catch (error) {
      console.error("Error loading kegiatan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) { toast.error("Silakan pilih bukti transfer"); return; }
    const rawAmount = Number(donationForm.amount.replace(/\D/g, ""));
    if (!rawAmount || rawAmount < 10000) {
      toast.error("Minimal donasi Rp 10.000"); return;
    }
    setSubmitting(true);
    try {
      await donasiService.createDonation({
        kegiatan_id: params.id as string,
        amount: rawAmount,
        donor_name: donationForm.donor_name || "Anonim",
        message: donationForm.message || undefined,
        bukti_transfer: selectedFile,
      });
      setSuccess(true);
      setDonationForm({ amount: "", donor_name: "", message: "" });
      setSelectedFile(null);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim donasi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (!rawValue) {
      setDonationForm({ ...donationForm, amount: "" });
      return;
    }
    const formatted = new Intl.NumberFormat("id-ID").format(Number(rawValue));
    setDonationForm({ ...donationForm, amount: formatted });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);

  const calculateProgress = (current: number, target: number) =>
    Math.min((current / target) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950 dark:via-teal-950 dark:to-green-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-semibold">Memuat kegiatan...</p>
        </div>
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950 dark:via-teal-950 dark:to-green-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Kegiatan Tidak Ditemukan</h1>
          <Link href="/kegiatan">
            <Button variant="outline" className="border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />Kembali ke Daftar Kegiatan
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(kegiatan.current_amount, kegiatan.target_amount);
  const hasPhotos = kegiatan.photos && kegiatan.photos.length > 0;
  const hasBanner = !!kegiatan.banner;
  const bannerSrc = hasBanner ? kegiatan.banner! : hasPhotos ? kegiatan.photos[0] : null;
  const hasPaymentInfo = kegiatan.bank_name || kegiatan.bank_account_number || kegiatan.qr_image;
  const hasJadwal = kegiatan.jadwal && Array.isArray(kegiatan.jadwal) && kegiatan.jadwal.length > 0;
  const hasActivityUpdates = kegiatan.activity_updates && kegiatan.activity_updates.length > 0;
  const hasExpenseReports = kegiatan.expense_reports && kegiatan.expense_reports.length > 0;
  const hasDonations = kegiatan.donations && kegiatan.donations.length > 0;
  const hasLocation = kegiatan.village_name || kegiatan.district || kegiatan.province;
  const totalExpense = hasExpenseReports ? kegiatan.expense_reports.reduce((s, r) => s + Number(r.amount), 0) : 0;

  const copyRekening = () => {
    if (kegiatan.bank_account_number) {
      navigator.clipboard.writeText(kegiatan.bank_account_number);
      setCopiedRek(true);
      setTimeout(() => setCopiedRek(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950 dark:via-teal-950 dark:to-green-950 transition-colors duration-300">

      {/* ── LIGHTBOX ── */}
      {lightboxOpen && hasPhotos && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close btn */}
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
            {lightboxIndex + 1} / {kegiatan.photos.length}
          </div>

          {/* Prev */}
          {kegiatan.photos.length > 1 && (
            <button
              className="absolute left-3 sm:left-6 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i - 1 + kegiatan.photos.length) % kegiatan.photos.length); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Main image */}
          <img
            src={getImageUrl(kegiatan.photos[lightboxIndex])}
            alt={`foto-${lightboxIndex + 1}`}
            className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {kegiatan.photos.length > 1 && (
            <button
              className="absolute right-3 sm:right-6 w-11 h-11 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((i) => (i + 1) % kegiatan.photos.length); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Thumbnail strip */}
          {kegiatan.photos.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-1">
              {kegiatan.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                  className={`shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === lightboxIndex
                      ? "border-emerald-400 scale-110"
                      : "border-white/30 opacity-50 hover:opacity-90"
                  }`}
                >
                  <img src={getImageUrl(photo)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── QR LIGHTBOX ── */}
      {qrLightboxOpen && kegiatan.qr_image && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center backdrop-blur-sm"
          onClick={() => setQrLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setQrLightboxOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={getImageUrl(kegiatan.qr_image)}
            alt="QR Code Pembayaran Full"
            className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl shadow-2xl bg-white p-4 lg:p-6"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-emerald-100 dark:border-gray-800 shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-gray-900 transition-colors duration-300"></div>
              </div>
              <div>
                <span className="text-lg font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent block leading-tight">
                  Desa Cerdas
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
                  Sistem Informasi Desa
                </span>
              </div>
            </Link>
            <Link href="/kegiatan">
              <Button variant="outline" className="border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold transition-colors duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />Kembali
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="relative h-72 sm:h-80 md:h-96 bg-gradient-to-r from-emerald-700 to-teal-700 overflow-hidden">
        {bannerSrc ? (
          <>
            <img
              src={getImageUrl(bannerSrc)}
              alt={kegiatan.title}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => { setLightboxIndex(0); setLightboxOpen(true); }}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/40 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
              <ZoomIn className="w-3.5 h-3.5" />Klik untuk perbesar
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Home className="w-24 h-24 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 pointer-events-none">
          {kegiatan.status === "ACTIVE" ? (
            <Badge className="bg-emerald-600/90 text-white backdrop-blur-sm border border-white/20 shadow-lg">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Program Aktif
            </Badge>
          ) : (
            <Badge className="bg-gray-600/90 text-white backdrop-blur-sm border border-white/20 shadow-lg pr-4">
              Program Selesai / Ditutup
            </Badge>
          )}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">

            {/* Progress */}
            <Card className="border-2 border-emerald-100 dark:border-emerald-900 shadow-xl bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Dana Terkumpul</p>
                    <p className="text-4xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                      {formatCurrency(kegiatan.current_amount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Target</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{formatCurrency(kegiatan.target_amount)}</p>
                  </div>
                </div>
                <Progress value={progress} className="h-3 mb-4 dark:bg-gray-700" />
                <div className="flex justify-between items-center">
                  <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 font-bold transition-colors">
                    {progress.toFixed(1)}% tercapai
                  </Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sisa: <span className="font-bold">{formatCurrency(kegiatan.target_amount - kegiatan.current_amount)}</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Detail */}
            <Card className="border-2 border-emerald-100 dark:border-emerald-900 shadow-xl bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-3xl font-black text-gray-900 dark:text-gray-100 leading-tight">{kegiatan.title}</CardTitle>
                <div className="h-1 w-24 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 rounded-full mt-2"></div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">Deskripsi Program</h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{kegiatan.description}</p>
                </div>
                {(kegiatan.start_date || kegiatan.end_date) && (
                  <div className="border-t border-emerald-100 dark:border-gray-700 pt-6">
                    <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">Periode Kegiatan</h3>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                      <span>
                        {new Date(kegiatan.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        {kegiatan.end_date && ` - ${new Date(kegiatan.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
                      </span>
                    </div>
                  </div>
                )}
                {hasLocation && (
                  <div className="border-t border-emerald-100 dark:border-gray-700 pt-6">
                    <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">Lokasi</h3>
                    <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">
                          {[kegiatan.village_name, kegiatan.district, kegiatan.province].filter(Boolean).join(", ")}
                        </p>
                        {kegiatan.google_maps_link && (
                          <a
                            href={kegiatan.google_maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline mt-1 inline-block"
                          >
                            Lihat di Google Maps &rarr;
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── JADWAL KEGIATAN ── */}
            {hasJadwal && (
              <Card className="border-2 border-emerald-100 dark:border-emerald-900 shadow-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 border-b-2 border-emerald-100 dark:border-emerald-900/50 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">Jadwal Kegiatan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {(kegiatan.jadwal as JadwalItem[]).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-emerald-50/30 dark:from-gray-800/50 dark:to-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-200 dark:hover:border-emerald-700 transition-colors"
                      >
                        <div className="flex flex-col items-center min-w-[56px] bg-white dark:bg-gray-700 rounded-xl p-2 border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                            {new Date(item.tanggal).toLocaleDateString("id-ID", { month: "short" })}
                          </span>
                          <span className="text-xl font-black text-gray-900 dark:text-gray-100">
                            {new Date(item.tanggal).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{item.nama_kegiatan}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.tanggal).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.waktu}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0">
                          #{idx + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── FOTO GALERI ── */}
            {hasPhotos && (
              <Card className="border-2 border-emerald-100 dark:border-emerald-900 shadow-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/40 border-b-2 border-emerald-100 dark:border-emerald-900/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Images className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">Foto Kegiatan</CardTitle>
                    </div>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 font-bold">
                      {kegiatan.photos.length} foto
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-3">
                  {kegiatan.photos.length === 1 && (
                    <GalleryThumb photo={kegiatan.photos[0]} idx={0} onOpen={(i) => { setLightboxIndex(i); setLightboxOpen(true); }} aspectClass="aspect-video" />
                  )}

                  {kegiatan.photos.length === 2 && (
                    <div className="grid grid-cols-2 gap-3">
                      {kegiatan.photos.map((p, i) => (
                        <GalleryThumb key={i} photo={p} idx={i} onOpen={(i) => { setLightboxIndex(i); setLightboxOpen(true); }} aspectClass="aspect-video" />
                      ))}
                    </div>
                  )}

                  {kegiatan.photos.length >= 3 && (
                    <>
                      {/* First photo — wide banner */}
                      <div className="relative">
                        <GalleryThumb
                          photo={kegiatan.photos[0]}
                          idx={0}
                          onOpen={(i) => { setLightboxIndex(i); setLightboxOpen(true); }}
                          aspectClass="aspect-[16/7]"
                        />
                        <div className="absolute top-3 left-3 bg-amber-400/90 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full pointer-events-none">
                          Banner Utama
                        </div>
                      </div>

                      {/* Remaining thumbnails */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {kegiatan.photos.slice(1).map((photo, idx) => {
                          const realIdx = idx + 1;
                          const showOverlay = realIdx === 3 && kegiatan.photos.length > 4;
                          const hiddenCount = kegiatan.photos.length - 4;
                          return (
                            <div
                              key={realIdx}
                              className="relative rounded-xl overflow-hidden cursor-zoom-in group aspect-square bg-gray-100 dark:bg-gray-700"
                              onClick={() => { setLightboxIndex(realIdx); setLightboxOpen(true); }}
                            >
                              <img
                                src={getImageUrl(photo)}
                                alt={`foto-${realIdx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              {showOverlay ? (
                                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-white pointer-events-none">
                                  <span className="text-2xl font-black">+{hiddenCount}</span>
                                  <span className="text-xs font-semibold mt-0.5">foto lagi</span>
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
                                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center pt-1">
                    Klik foto untuk melihat ukuran penuh · Gunakan tombol ← → atau arrow key untuk navigasi
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── PERKEMBANGAN KEGIATAN (Activity Updates) ── */}
            {hasActivityUpdates && (
              <Card className="border-2 border-blue-100 dark:border-blue-900 shadow-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 border-b-2 border-blue-100 dark:border-blue-900/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">Perkembangan Kegiatan</CardTitle>
                    </div>
                    <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold">
                      {kegiatan.activity_updates.length} update
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {kegiatan.activity_updates.map((update) => (
                    <div key={update.id} className="relative pl-6 border-l-2 border-blue-200 dark:border-blue-800/50 pb-4 last:pb-0">
                      <div className="absolute top-0 left-[-5px] w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">
                        {new Date(update.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                      <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">{update.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line">{update.description}</p>
                      {update.photo && (
                        <img
                          src={getImageUrl(update.photo)}
                          alt={update.title}
                          className="mt-3 rounded-xl border border-blue-100 dark:border-blue-900/50 max-w-full h-auto max-h-52 object-cover cursor-zoom-in"
                          onClick={() => {
                            setLightboxIndex(0);
                            setLightboxOpen(true);
                          }}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ── TRANSPARANSI PENGELUARAN (Expense Reports) ── */}
            {hasExpenseReports && (
              <Card className="border-2 border-orange-100 dark:border-orange-900 shadow-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/40 border-b-2 border-orange-100 dark:border-orange-900/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">Transparansi Pengeluaran</CardTitle>
                        <CardDescription className="text-xs dark:text-gray-400">Total: {formatCurrency(totalExpense)}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3">
                    {kegiatan.expense_reports.map((report) => (
                      <div key={report.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-orange-50/30 dark:from-gray-800/50 dark:to-orange-900/20 border border-orange-100 dark:border-orange-800/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{report.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {new Date(report.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-black text-orange-700 dark:text-orange-400">{formatCurrency(Number(report.amount))}</p>
                          {report.receipt_image && (
                            <a
                              href={getImageUrl(report.receipt_image)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 underline"
                            >
                              Lihat struk
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── DAFTAR DONATUR ── */}
            {hasDonations && (
              <Card className="border-2 border-purple-100 dark:border-purple-900 shadow-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/40 border-b-2 border-purple-100 dark:border-purple-900/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">Donatur</CardTitle>
                    </div>
                    <Badge className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800 font-bold">
                      {kegiatan.donations.length} donatur
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5">
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {kegiatan.donations.map((donation) => (
                       <div key={donation.id} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/20 border border-purple-100 dark:border-purple-800/50">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(donation.donor_name || donation.user?.nama || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                              {donation.donor_name || donation.user?.nama || "Anonim"}
                            </p>
                            <p className="text-sm font-black text-purple-700 dark:text-purple-400 shrink-0 ml-2">
                              {formatCurrency(Number(donation.amount))}
                            </p>
                          </div>
                          {donation.message && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />
                              <span className="italic">&ldquo;{donation.message}&rdquo;</span>
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(donation.approved_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN — Payment Info & Donation Form */}
          <div className="lg:col-span-1 space-y-6">

            {/* ── INFO PEMBAYARAN / REKENING / QR ── */}
            {hasPaymentInfo && (
              <Card className="border-2 border-amber-200 dark:border-amber-900 shadow-xl overflow-hidden bg-white dark:bg-gray-800 transition-colors duration-300">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/40 border-b-2 border-amber-200 dark:border-amber-900/50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100">Informasi Transfer</CardTitle>
                      <CardDescription className="text-xs dark:text-gray-400">Transfer ke rekening berikut</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {/* QR Code */}
                  {kegiatan.qr_image && (
                    <div className="flex flex-col items-center gap-3">
                      <div 
                        className="relative bg-white p-3 rounded-2xl border-2 border-amber-200 dark:border-amber-800 shadow-inner cursor-zoom-in hover:shadow-md transition-all group"
                        onClick={() => setQrLightboxOpen(true)}
                      >
                        <img
                          src={getImageUrl(kegiatan.qr_image)}
                          alt="QR Code Pembayaran"
                          className="w-48 h-48 object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/5 dark:bg-black/20 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-8 h-8 text-amber-600 dark:text-amber-400 drop-shadow-md" />
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 text-center">
                        <div className="flex items-center gap-1.5">
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Scan QR code untuk transfer</span>
                        </div>
                        <span className="text-amber-600 dark:text-amber-400 font-medium">(Klik gambar untuk memperbesar)</span>
                      </div>
                    </div>
                  )}

                  {/* Bank Info */}
                  {(kegiatan.bank_name || kegiatan.bank_account_number) && (
                    <div className="bg-gradient-to-r from-gray-50 to-amber-50/30 dark:from-gray-800/50 dark:to-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800/50 space-y-3">
                      {kegiatan.bank_name && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bank</p>
                          <p className="text-base font-black text-gray-900 dark:text-gray-100">{kegiatan.bank_name}</p>
                        </div>
                      )}
                      {kegiatan.bank_account_number && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nomor Rekening</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-lg font-black text-amber-700 dark:text-amber-400 tracking-wider">{kegiatan.bank_account_number}</p>
                            <button
                              onClick={copyRekening}
                              className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                              title="Salin nomor rekening"
                            >
                              {copiedRek ? (
                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {kegiatan.bank_account_name && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Atas Nama</p>
                          <p className="text-base font-bold text-gray-900 dark:text-gray-100">{kegiatan.bank_account_name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── DONATION FORM ── */}
            <Card className="border-2 border-emerald-100 dark:border-emerald-900 shadow-xl sticky top-24 bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${kegiatan.status === "ACTIVE" ? 'bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500' : 'bg-gray-400 dark:bg-gray-600'}`}>
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
                      {kegiatan.status === "ACTIVE" ? "Kirim Donasi" : "Program Ditutup"}
                    </CardTitle>
                    <CardDescription className="text-xs dark:text-gray-400">
                      {kegiatan.status === "ACTIVE" ? "Bantu wujudkan program ini" : "Terima kasih atas partisipasi Anda"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {kegiatan.status !== "ACTIVE" ? (
                  <div className="text-center py-6">
                    <Alert className="border-2 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <AlertDescription className="text-gray-600 dark:text-gray-300 font-medium">
                        Penggalangan dana untuk kegiatan ini telah berakhir atau ditutup. Terima kasih atas dukungan dan partisipasi dari seluruh donatur.
                      </AlertDescription>
                    </Alert>
                  </div>
                ) : (
                  <>
                    {success && (
                      <Alert className="mb-6 border-2 border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/30">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertDescription className="text-green-800 dark:text-green-300 font-semibold">
                          Donasi berhasil dikirim! Terima kasih atas kontribusi Anda.
                        </AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmitDonation} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Jumlah Donasi <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400 font-semibold">Rp</span>
                          <Input
                            id="amount" type="text" inputMode="numeric" required
                            value={donationForm.amount}
                            onChange={handleAmountChange}
                            placeholder="10.000"
                            className="pl-10 h-11 border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                            disabled={submitting}
                          />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Minimal donasi Rp 10.000</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="donor_name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Nama Donatur
                          <Badge variant="secondary" className="ml-2 text-xs dark:bg-gray-700 dark:text-gray-300">Opsional</Badge>
                        </Label>
                        <Input
                          id="donor_name" type="text"
                          value={donationForm.donor_name}
                          onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })}
                          placeholder="Nama Anda (opsional)"
                          className="h-11 border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500"
                          disabled={submitting}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Kosongkan untuk donasi anonim</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Pesan / Doa
                          <Badge variant="secondary" className="ml-2 text-xs dark:bg-gray-700 dark:text-gray-300">Opsional</Badge>
                        </Label>
                        <Textarea
                          id="message"
                          value={donationForm.message}
                          onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })}
                          placeholder="Semoga bermanfaat untuk warga desa..."
                          className="border-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                          rows={2}
                          maxLength={500}
                          disabled={submitting}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bukti" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Bukti Transfer <span className="text-red-500">*</span>
                        </Label>
                        <label
                          htmlFor="bukti"
                          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                            selectedFile ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center py-4">
                            {selectedFile ? (
                              <>
                                <FileImage className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mb-2" />
                                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Klik untuk mengganti file</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Upload bukti transfer</p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, PDF (Max 5MB)</p>
                              </>
                            )}
                          </div>
                          <input id="bukti" type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} disabled={submitting} />
                        </label>
                      </div>

                      <Button
                        type="submit" disabled={submitting}
                        className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-500 dark:to-teal-500 text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                      >
                        {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Mengirim Donasi...</> : <><Heart className="mr-2 h-5 w-5" />Kirim Donasi Sekarang</>}
                      </Button>

                      <div className="pt-4 border-t border-emerald-100 dark:border-gray-700">
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Donasi Anda akan diverifikasi oleh admin desa. Bukti transfer akan disimpan dengan aman untuk transparansi.
                          </p>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Helper component ────────────────────────────────────────────────────────
function GalleryThumb({
  photo, idx, onOpen, aspectClass,
}: {
  photo: string;
  idx: number;
  onOpen: (idx: number) => void;
  aspectClass: string;
}) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden cursor-zoom-in group ${aspectClass} bg-gray-100`}
      onClick={() => onOpen(idx)}
    >
      <img
        src={getImageUrl(photo)}
        alt={`foto-${idx + 1}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
        <ZoomIn className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
      </div>
    </div>
  );
}