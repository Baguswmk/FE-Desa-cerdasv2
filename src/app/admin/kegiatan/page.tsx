"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  Heart,
  LogOut,
  ClipboardList,
  Loader2,
  PlusCircle,
  Calendar,
  TrendingUp,
  Edit2,
  Eye,
  Trash2,
  X,
  Upload,
  ImagePlus,
  Images,
  Star,
  AlertCircle,
  CheckCircle2,
  Info,
  Clock,
  CreditCard,
  QrCode,
  Plus,
  Minus,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { kegiatanService } from "@/services/kegiatan.service";
import AdminNavbar from "@/components/AdminNavbar";

// ─── Banner size guide ─────────────────────────────────────────────────────
const BANNER_SPEC = {
  recommended: "1920 × 640 px",
  ratio: "3:1",
  minWidth: "1280 px",
  maxSize: "5 MB",
  formats: "JPG, PNG, WebP",
  note: "Foto pertama dalam daftar otomatis menjadi banner utama.",
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const getImageUrl = (photo: string) =>
  `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/uploads/${photo}`;

export default function AdminKegiatanPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [kegiatan, setKegiatan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteModal, setDeleteModal] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [kPage, setKPage] = useState(1);
  const K_PER_PAGE = 8;

  // form
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target_amount: "",
    start_date: "",
    end_date: "",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
    village_name: "",
    district: "",
    province: "",
    google_maps_link: "",
  });
  const [jadwalItems, setJadwalItems] = useState<{ tanggal: string; waktu: string; nama_kegiatan: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  // existing media
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [existingBanner, setExistingBanner] = useState<string | null>(null);
  const [existingQr, setExistingQr] = useState<string | null>(null);

  // per-card photo upload state
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const addPhotoRef = useRef<HTMLInputElement>(null);

  // toast
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (!storedUser || storedUser.role !== "ADMIN") {
      router.push("/login");
      return;
    }
    setUser(storedUser);
    loadKegiatan();
  }, [router]);

  const loadKegiatan = async () => {
    try {
      const response = await kegiatanService.getAll("ALL");
      const raw = response.data;
      setKegiatan(Array.isArray(raw) ? raw : (raw?.data || []));
    } catch (error) {
      console.error("Error loading kegiatan:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Create/Edit form file handling ──────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length)
      showToast("error", "Beberapa file melebihi 5 MB dan diabaikan.");
    setSelectedFiles((prev) => [...prev, ...valid]);
    const previews = valid.map((f) => URL.createObjectURL(f));
    setFilePreviews((prev) => [...prev, ...previews]);
    e.target.value = "";
  };

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
    setFilePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Submit create / edit form ────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("description", formData.description);
      payload.append("target_amount", formData.target_amount);
      payload.append("start_date", new Date(formData.start_date).toISOString());
      if (formData.end_date)
        payload.append("end_date", new Date(formData.end_date).toISOString());

      // Jadwal
      if (jadwalItems.length > 0) {
        payload.append("jadwal", JSON.stringify(jadwalItems));
      }

      // Payment info
      if (formData.bank_name) payload.append("bank_name", formData.bank_name);
      if (formData.bank_account_number) payload.append("bank_account_number", formData.bank_account_number);
      if (formData.bank_account_name) payload.append("bank_account_name", formData.bank_account_name);

      // Location info
      if (formData.village_name) payload.append("village_name", formData.village_name);
      if (formData.district) payload.append("district", formData.district);
      if (formData.province) payload.append("province", formData.province);
      if (formData.google_maps_link) payload.append("google_maps_link", formData.google_maps_link);

      // Files
      selectedFiles.forEach((f) => payload.append("photos", f));
      if (bannerFile) payload.append("banner", bannerFile);
      if (qrFile) payload.append("qr_image", qrFile);

      if (editingId) {
        await kegiatanService.update(editingId, payload);
        showToast("success", "Kegiatan berhasil diperbarui!");
      } else {
        await kegiatanService.create(payload);
        showToast("success", "Kegiatan berhasil dibuat!");
      }
      resetForm();
      loadKegiatan();
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Gagal menyimpan kegiatan",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      target_amount: "",
      start_date: "",
      end_date: "",
      bank_name: "",
      bank_account_number: "",
      bank_account_name: "",
      village_name: "",
      district: "",
      province: "",
      google_maps_link: "",
    });
    setJadwalItems([]);
    setSelectedFiles([]);
    setFilePreviews([]);
    setBannerFile(null);
    setBannerPreview(null);
    setQrFile(null);
    setQrPreview(null);
    setExistingPhotos([]);
    setExistingBanner(null);
    setExistingQr(null);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      description: item.description,
      target_amount: item.target_amount.toString(),
      start_date: new Date(item.start_date).toISOString().split("T")[0],
      end_date: item.end_date
        ? new Date(item.end_date).toISOString().split("T")[0]
        : "",
      bank_name: item.bank_name || "",
      bank_account_number: item.bank_account_number || "",
      bank_account_name: item.bank_account_name || "",
      village_name: item.village_name || "",
      district: item.district || "",
      province: item.province || "",
      google_maps_link: item.google_maps_link || "",
    });
    setJadwalItems(
      Array.isArray(item.jadwal) ? item.jadwal : []
    );
    setSelectedFiles([]);
    setFilePreviews([]);
    setBannerFile(null);
    setBannerPreview(null);
    setQrFile(null);
    setQrPreview(null);
    setExistingPhotos(item.photos || []);
    setExistingBanner(item.banner || null);
    setExistingQr(item.qr_image || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await kegiatanService.delete(id);
      showToast("success", "Kegiatan berhasil dihapus.");
      setDeleteModal(null);
      loadKegiatan();
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Gagal menghapus kegiatan",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteExistingPhoto = async (photoName: string) => {
    if (!editingId) return;
    if (!confirm("Hapus foto yang sudah ada dari server? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      await kegiatanService.deletePhoto(editingId, photoName);
      setExistingPhotos((prev) => prev.filter((p) => p !== photoName));
      showToast("success", "Foto berhasil dihapus.");
      loadKegiatan();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Gagal menghapus foto");
    }
  };

  // ── Add photos to existing kegiatan ────────────────────────────────────
  const handleAddPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    setUploadFiles(valid);
    setUploadPreviews(valid.map((f) => URL.createObjectURL(f)));
    e.target.value = "";
  };

  const handleAddPhotos = async (kegiatanId: string) => {
    if (!uploadFiles.length) return;
    setUploadingId(kegiatanId);
    try {
      const fd = new FormData();
      uploadFiles.forEach((f) => fd.append("photos", f));
      await kegiatanService.addPhotos(kegiatanId, fd);
      showToast("success", "Foto berhasil ditambahkan!");
      setUploadingFor(null);
      setUploadFiles([]);
      setUploadPreviews([]);
      loadKegiatan();
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Gagal menambahkan foto",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleDeletePhoto = async (kegiatanId: string, photoName: string) => {
    if (!confirm("Hapus foto ini?")) return;
    try {
      await kegiatanService.deletePhoto(kegiatanId, photoName);
      showToast("success", "Foto berhasil dihapus.");
      loadKegiatan();
    } catch (error: any) {
      showToast(
        "error",
        error.response?.data?.message || "Gagal menghapus foto",
      );
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const calculateProgress = (current: number, target: number) =>
    Math.min((current / target) * 100, 100);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Memuat data...</p>
        </div>
      </div>
    );
  }

  const filteredKegiatan = kegiatan.filter((item: any) =>
    item.title?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPagesKegiatan = Math.ceil(filteredKegiatan.length / K_PER_PAGE);
  const paginatedKegiatan = filteredKegiatan.slice((kPage - 1) * K_PER_PAGE, kPage * K_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]"></div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border-2 animate-in slide-in-from-top-4 duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-red-50 border-red-200 text-red-900"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <span className="font-semibold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Navbar */}
      <AdminNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <ClipboardList className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Kelola Kegiatan Desa
              </h1>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-medium">
                Buat, edit, kelola foto, dan hapus kegiatan
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg shadow-emerald-200 hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm h-11 px-6 rounded-xl"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Buat Kegiatan
          </Button>
        </div>

        {/* ── CREATE / EDIT FORM MODAL ── */}
        {showForm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
              onClick={resetForm} 
            />
            <Card className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 border-0 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700 p-6 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm text-emerald-600 dark:text-emerald-400">
                      {editingId ? <Edit2 className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
                        {editingId ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}
                      </CardTitle>
                      <CardDescription className="text-sm mt-0.5 dark:text-gray-400">
                        {editingId
                          ? "Perbarui informasi kegiatan"
                          : "Isi form untuk membuat kegiatan baru"}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetForm}
                    className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 dark:text-gray-400 w-8 h-8 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/50 dark:bg-gray-900/50">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Judul Kegiatan *
                  </Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Contoh: Pembangunan Jalan Desa"
                    className="h-12 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Deskripsi *
                  </Label>
                  <Textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Deskripsikan kegiatan secara detail..."
                    className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                  />
                </div>

                {/* Amount + Dates */}
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Target Dana (Rp) *
                    </Label>
                    <Input
                      required
                      type="number"
                      min="1"
                      value={formData.target_amount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_amount: e.target.value,
                        })
                      }
                      placeholder="10000000"
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tanggal Mulai *
                    </Label>
                    <Input
                      required
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Tanggal Selesai (opsional)
                    </Label>
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="h-12 border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* ── PHOTO UPLOAD (create/edit) ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Foto Galeri Kegiatan
                    </Label>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      {selectedFiles.length} file dipilih
                    </span>
                  </div>

                  {/* Banner spec info */}
                  <div className="flex gap-2 items-start rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800/50 p-4">
                    <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                      <p className="font-bold">Panduan Ukuran Foto Banner</p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mt-1">
                        <span>
                          Resolusi ideal:{" "}
                          <strong>{BANNER_SPEC.recommended}</strong>
                        </span>
                        <span>
                          Rasio: <strong>{BANNER_SPEC.ratio}</strong>
                        </span>
                        <span>
                          Min lebar: <strong>{BANNER_SPEC.minWidth}</strong>
                        </span>
                        <span>
                          Maks ukuran: <strong>{BANNER_SPEC.maxSize}</strong>
                        </span>
                        <span>
                          Format: <strong>{BANNER_SPEC.formats}</strong>
                        </span>
                      </div>
                      <p className="mt-1 text-emerald-700 dark:text-emerald-400">
                        <Star className="w-3 h-3 inline mr-1" />
                        {BANNER_SPEC.note}
                      </p>
                    </div>
                  </div>

                  {/* Drop zone */}
                  <label
                    className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-emerald-300 dark:border-emerald-700/50 rounded-xl cursor-pointer bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-500 dark:hover:border-emerald-600 transition-all group"
                  >
                    <ImagePlus className="w-10 h-10 text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 mb-2 transition-colors" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                      Klik atau seret foto ke sini
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      JPG, PNG, WebP — maks 5 MB per file
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>

                  {/* Preview grid */}
                  {(filePreviews.length > 0 || existingPhotos.length > 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingPhotos.map((photo, idx) => (
                        <div
                          key={`existing-${idx}`}
                          className="relative group rounded-xl overflow-hidden border-2 border-emerald-100 aspect-video bg-gray-100"
                        >
                          <img
                            src={getImageUrl(photo)}
                            alt={`existing-${idx}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center shadow-md">
                            Tersimpan
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteExistingPhoto(photo)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus foto dari server"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      {filePreviews.map((src, idx) => (
                        <div
                          key={`new-${idx}`}
                          className="relative group rounded-xl overflow-hidden border-2 border-emerald-100 aspect-video bg-gray-100"
                        >
                          <img
                            src={src}
                            alt={`preview-${idx}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 && (
                            <div className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Star className="w-2.5 h-2.5" /> Banner
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeSelectedFile(idx)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── BANNER UPLOAD ── */}
                <div className="space-y-3">
                  <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Banner Kegiatan (opsional)
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Banner terpisah dari galeri foto. Ukuran ideal: 1920×640px (rasio 3:1)
                  </p>
                  <label
                    className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer bg-blue-50/50 hover:bg-blue-50 hover:border-blue-500 transition-all group overflow-hidden"
                  >
                    {bannerPreview || existingBanner ? (
                      <div className="relative w-full h-full group">
                        <img 
                          src={bannerPreview || getImageUrl(existingBanner!)} 
                          alt="banner preview" 
                          className="w-full h-full object-cover" 
                        />
                        {!bannerPreview && (
                          <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                            Tersimpan
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImagePlus className="w-6 h-6 text-white mb-1" />
                          <span className="text-white text-xs font-semibold">Ganti Banner</span>
                        </div>
                        {bannerPreview && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setBannerFile(null); setBannerPreview(null); }}
                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8 text-blue-400 group-hover:text-blue-600 mb-1 transition-colors" />
                        <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-700">Upload Banner</p>
                        <p className="text-xs text-gray-400">JPG, PNG — maks 5 MB</p>
                      </>
                    )}
                    <input
                      ref={bannerInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) { showToast("error", "Banner melebihi 5 MB"); return; }
                          setBannerFile(file);
                          setBannerPreview(URL.createObjectURL(file));
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                {/* ── JADWAL KEGIATAN ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Jadwal Kegiatan (opsional)
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setJadwalItems([...jadwalItems, { tanggal: "", waktu: "", nama_kegiatan: "" }])}
                      className="h-8 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-300 font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Tambah Jadwal
                    </Button>
                  </div>

                  {jadwalItems.length === 0 && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                      Belum ada jadwal. Klik &quot;Tambah Jadwal&quot; untuk menambahkan.
                    </p>
                  )}

                  {jadwalItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Tanggal</Label>
                          <Input
                            type="date"
                            value={item.tanggal}
                            onChange={(e) => {
                              const updated = [...jadwalItems];
                              updated[idx].tanggal = e.target.value;
                              setJadwalItems(updated);
                            }}
                            className="h-9 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Waktu</Label>
                          <Input
                            type="time"
                            value={item.waktu}
                            onChange={(e) => {
                              const updated = [...jadwalItems];
                              updated[idx].waktu = e.target.value;
                              setJadwalItems(updated);
                            }}
                            className="h-9 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500 dark:text-gray-400">Nama Kegiatan</Label>
                          <Input
                            value={item.nama_kegiatan}
                            onChange={(e) => {
                              const updated = [...jadwalItems];
                              updated[idx].nama_kegiatan = e.target.value;
                              setJadwalItems(updated);
                            }}
                            placeholder="Contoh: Pembukaan"
                            className="h-9 border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => setJadwalItems(jadwalItems.filter((_, i) => i !== idx))}
                        className="h-9 w-9 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 mt-5 shrink-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* ── INFO LOKASI ── */}
                <div className="space-y-4">
                  <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Lokasi Kegiatan (opsional)
                  </Label>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800/50 rounded-xl space-y-3">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Nama Desa</Label>
                        <Input
                          value={formData.village_name}
                          onChange={(e) => setFormData({ ...formData, village_name: e.target.value })}
                          placeholder="Desa Sukamaju"
                          className="h-10 border-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Kecamatan</Label>
                        <Input
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                          placeholder="Kecamatan..."
                          className="h-10 border-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Provinsi</Label>
                        <Input
                          value={formData.province}
                          onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                          placeholder="Jawa Barat"
                          className="h-10 border-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-600 dark:text-gray-400">Link Google Maps</Label>
                      <Input
                        value={formData.google_maps_link}
                        onChange={(e) => setFormData({ ...formData, google_maps_link: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="h-10 border-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* ── INFO REKENING ── */}
                <div className="space-y-4">
                  <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Informasi Pembayaran (opsional)
                  </Label>
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800/50 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                      <span className="text-sm font-bold text-amber-800 dark:text-amber-400">Rekening Transfer</span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Nama Bank</Label>
                        <Input
                          value={formData.bank_name}
                          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                          placeholder="BCA, BRI, Mandiri..."
                          className="h-10 border-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Nomor Rekening</Label>
                        <Input
                          value={formData.bank_account_number}
                          onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                          placeholder="1234567890"
                          className="h-10 border-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Atas Nama</Label>
                        <Input
                          value={formData.bank_account_name}
                          onChange={(e) => setFormData({ ...formData, bank_account_name: e.target.value })}
                          placeholder="Nama pemilik rekening"
                          className="h-10 border-2 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    {/* QR Upload */}
                    <div className="pt-3 border-t border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <QrCode className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-bold text-amber-800">QR Code Pembayaran</span>
                      </div>
                      <label
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer bg-white/60 hover:bg-amber-50 hover:border-amber-500 transition-all group overflow-hidden"
                      >
                        {qrPreview || existingQr ? (
                          <div className="relative h-full w-full p-2 group">
                            <img src={qrPreview || getImageUrl(existingQr!)} alt="QR preview" className="w-full h-full object-contain" />
                            {!qrPreview && (
                              <div className="absolute top-1.5 left-1.5 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md z-10">
                                Tersimpan
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <ImagePlus className="w-6 h-6 text-white mb-1" />
                              <span className="text-white text-xs font-semibold">Ganti QR</span>
                            </div>
                            {qrPreview && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setQrFile(null); setQrPreview(null); }}
                                className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-10"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <QrCode className="w-8 h-8 text-amber-400 group-hover:text-amber-600 mb-1 transition-colors" />
                            <p className="text-sm font-semibold text-gray-600 group-hover:text-amber-700">Upload QR Code</p>
                            <p className="text-xs text-gray-400">JPG, PNG — maks 5 MB</p>
                          </>
                        )}
                        <input
                          ref={qrInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 5 * 1024 * 1024) { showToast("error", "QR image melebihi 5 MB"); return; }
                              setQrFile(file);
                              setQrPreview(URL.createObjectURL(file));
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-8 sticky bottom-0 pb-2 bg-gray-50/50 dark:bg-gray-900/50">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md rounded-xl transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Menyimpan...
                      </>
                    ) : editingId ? (
                      "Simpan Perubahan"
                    ) : (
                      "Buat Kegiatan"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="h-12 px-6 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
            </Card>
          </div>
        )}

        {/* ── DELETE CONFIRM MODAL ── */}
        {deleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm" onClick={() => setDeleteModal(null)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-100 dark:border-red-900 w-full max-w-md animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-gray-100">Hapus Kegiatan</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tindakan ini tidak bisa dibatalkan</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setDeleteModal(null)} className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:text-gray-400 dark:hover:text-red-400">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-6 space-y-3">
                <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-800/50">
                  <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{deleteModal.title}</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Semua donasi, foto, dan data terkait kegiatan ini akan ikut dihapus secara permanen.
                </p>
              </div>
              <div className="flex gap-3 p-6 pt-0">
                <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1 border-2 font-semibold dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700" disabled={deleting}>
                  Batal
                </Button>
                <Button
                  onClick={() => handleDelete(deleteModal.id)}
                  disabled={deleting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-lg"
                >
                  {deleting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Menghapus...</>
                  ) : (
                    <><Trash2 className="w-4 h-4 mr-2" />Ya, Hapus</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── KEGIATAN TABLE ── */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Memuat kegiatan...</p>
          </div>
        ) : kegiatan.length === 0 ? (
          <Card className="border-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
            <CardContent className="text-center py-16">
              <div className="inline-block p-5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl mb-6">
                <ClipboardList className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3">Belum Ada Kegiatan</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto mb-6">
                Mulai dengan membuat kegiatan pertama untuk desa Anda
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Buat Kegiatan
              </Button>
            </CardContent>
          </Card>
        ) : (
            <Card className="border-2 shadow-2xl dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
              {/* Search bar */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari kegiatan..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setKPage(1); }}
                  className="w-full pl-9 pr-3 h-9 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:border-emerald-400 dark:bg-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                />
              </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap">
                  {filteredKegiatan.length} dari {kegiatan.length} kegiatan
                </span>
              </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b-2 border-gray-100 dark:border-gray-800">
                    <th className="text-left px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Kegiatan</th>
                    <th className="text-center px-4 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Status</th>
                    <th className="text-left px-4 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Periode</th>
                    <th className="text-right px-4 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Progress</th>
                    <th className="text-center px-4 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Foto</th>
                    <th className="text-center px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {paginatedKegiatan.map((item: any) => {
                      const progress = Math.min(
                        ((item.current_amount ?? 0) / (item.target_amount ?? 1)) * 100,
                        100,
                      );
                      const statusStyle: Record<string, string> = {
                        ACTIVE: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
                        COMPLETED: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
                        CANCELLED: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
                      };
                      return (
                        <tr key={item.id} className="hover:bg-emerald-50/30 dark:hover:bg-gray-700/50 transition-colors">
                          {/* Kegiatan */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail */}
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex-shrink-0 border-2 border-emerald-100 dark:border-gray-700">
                                {(item.banner || (item.photos && item.photos.length > 0)) ? (
                                  <img
                                    src={getImageUrl(item.banner || item.photos[0])}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Images className="w-6 h-6 text-emerald-400 dark:text-emerald-600" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[220px]">{item.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[220px] mt-0.5">{item.description}</p>
                              </div>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4 text-center">
                            <Badge className={`border font-bold text-xs px-2.5 py-1 ${statusStyle[item.status] ?? "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"}`}>
                              {item.status}
                            </Badge>
                          </td>

                          {/* Periode */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                <Calendar className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                                {new Date(item.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                              </div>
                              {item.end_date && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(item.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Progress */}
                          <td className="px-4 py-4 text-right">
                            <div className="min-w-[110px]">
                              <p className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                                {formatCurrency(item.current_amount ?? 0)}
                              </p>
                              <p className="text-xs text-gray-400">
                                / {formatCurrency(item.target_amount)}
                              </p>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 h-1.5 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5 text-right">{progress.toFixed(0)}%</p>
                            </div>
                          </td>

                          {/* Foto */}
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-1">
                              <Images className="w-3.5 h-3.5" />
                              {item.photos?.length ?? 0}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEdit(item)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 h-8 shadow"
                              >
                                <Edit2 className="w-3.5 h-3.5 mr-1" />Edit
                              </Button>
                              <Link href={`/kegiatan/${item.id}`}>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 h-8 shadow"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1" />Lihat
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                onClick={() => setDeleteModal({ id: item.id, title: item.title })}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 h-8 shadow"
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />Hapus
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Pagination kegiatan */}
            {totalPagesKegiatan > 1 && (
              <div className="border-t-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 px-5 py-3 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  <span className="text-gray-800 dark:text-gray-200">{(kPage - 1) * K_PER_PAGE + 1}</span>
                  {" – "}
                  <span className="text-gray-800 dark:text-gray-200">{Math.min(kPage * K_PER_PAGE, filteredKegiatan.length)}</span>
                  {" dari "}
                  <span className="text-gray-800 dark:text-gray-200">{filteredKegiatan.length}</span>
                  {" kegiatan"}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setKPage(p => Math.max(1, p - 1))}
                    disabled={kPage === 1}
                    className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-8 h-8 flex items-center justify-center">
                    {kPage}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setKPage(p => Math.min(totalPagesKegiatan, p + 1))}
                    disabled={kPage === totalPagesKegiatan}
                    className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            </Card>
        )}
      </div>
    </div>
  );
}
