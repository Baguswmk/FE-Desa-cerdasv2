"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Home,
  Heart,
  LogOut,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  User,
  Mail,
  ImageIcon,
  ExternalLink,
  AlertCircle,
  ClipboardList,
  RefreshCw,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { donasiService } from "@/services/donasi.service";
import AdminNavbar from "@/components/AdminNavbar";

interface Donation {
  id: string;
  kegiatan?: { title: string };
  donor_name?: string | null;
  user?: { email?: string; nama?: string } | null;
  amount: number;
  message?: string | null;
  bukti_transfer: string;
  created_at: string;
}

export default function AdminDonasiPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ role: string; nama?: string } | null>(
    null,
  );
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Pagination
  const [dPage, setDPage] = useState(1);
  const [dPerPage, setDPerPage] = useState<number | "ALL">(10);
  const D_PER_PAGE = dPerPage === "ALL" ? donations.length || 1 : dPerPage;

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<{
    type: "approve" | "reject" | "preview";
    donation: Donation;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // ── Toast ───────────────────────────────────────────────────────────────────
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
    loadDonations();
  }, [router]);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const response = await donasiService.getPendingDonations();
      setDonations(response.data || []);
    } catch (error) {
      console.error("Error loading donations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openApprove = (donation: Donation) =>
    setModal({ type: "approve", donation });
  const openReject = (donation: Donation) => {
    setRejectReason("");
    setRejectError("");
    setModal({ type: "reject", donation });
  };
  const openPreview = (donation: Donation) =>
    setModal({ type: "preview", donation });
  const closeModal = () => setModal(null);

  const handleApprove = async () => {
    if (!modal) return;
    setProcessing(modal.donation.id);
    try {
      await donasiService.approveDonation(modal.donation.id);
      showToast("success", "Donasi berhasil disetujui");
      closeModal();
      loadDonations();
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Gagal menyetujui donasi";
      showToast("error", msg);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!modal) return;
    if (!rejectReason.trim()) {
      setRejectError("Alasan penolakan wajib diisi");
      return;
    }
    setProcessing(modal.donation.id);
    try {
      await donasiService.rejectDonation(
        modal.donation.id,
        rejectReason.trim(),
      );
      showToast("success", "Donasi berhasil ditolak");
      closeModal();
      loadDonations();
    } catch (error: unknown) {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Gagal menolak donasi";
      showToast("error", msg);
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "");

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 relative overflow-hidden transition-colors duration-300">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
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

      {/* ── Approve Modal ──────────────────────────────────────────────────────── */}
      {modal?.type === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-emerald-100 dark:border-emerald-900/50 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-gray-100">Setujui Donasi</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Konfirmasi persetujuan
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800/50 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Donatur:</span>{" "}
                  {modal.donation.donor_name || "Anonim"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Kegiatan:</span>{" "}
                  {modal.donation.kegiatan?.title || "—"}
                </p>
                <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 text-lg">
                  {formatCurrency(modal.donation.amount)}
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Donasi ini akan disetujui dan nominal akan ditambahkan ke total
                donasi kegiatan.
              </p>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1 border-2 font-semibold dark:border-gray-700 dark:hover:bg-gray-700"
              >
                Batal
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing === modal.donation.id}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg"
              >
                {processing === modal.donation.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Ya, Setujui
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ───────────────────────────────────────────────────────── */}
      {modal?.type === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-red-100 dark:border-red-900/50 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-gray-100">Tolak Donasi</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Isi alasan penolakan</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800/50 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Donatur:</span>{" "}
                  {modal.donation.donor_name || "Anonim"}
                </p>
                <p className="text-sm font-black text-red-700 dark:text-red-400 text-lg">
                  {formatCurrency(modal.donation.amount)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Alasan Penolakan *
                </Label>
                <Textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError("");
                  }}
                  placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll."
                  className={`border-2 focus:border-red-400 dark:border-gray-700 dark:bg-gray-900 resize-none ${rejectError ? "border-red-400 bg-red-50 dark:bg-red-900/20" : ""}`}
                />
                {rejectError && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {rejectError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3 p-6 pt-0">
              <Button
                variant="outline"
                onClick={closeModal}
                className="flex-1 border-2 font-semibold"
              >
                Batal
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing === modal.donation.id}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold shadow-lg"
              >
                {processing === modal.donation.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak Donasi
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bukti Preview Modal ─────────────────────────────────────────────────── */}
      {modal?.type === "preview" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 w-full max-w-4xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Bukti Transfer — {modal.donation.donor_name || "Anonim"}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                className="hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:text-gray-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 flex justify-center bg-gray-50/50 dark:bg-gray-900/30 overflow-auto">
              {modal.donation.bukti_transfer ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`${apiBase}/uploads/${modal.donation.bukti_transfer}`}
                  alt="Bukti Transfer"
                  className="w-auto h-auto rounded-xl object-contain max-h-[80vh] shadow-sm"
                />
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <AlertCircle className="w-8 h-8 mr-2" /> Tidak ada bukti
                  transfer
                </div>
              )}
            </div>
            <div className="flex gap-3 p-4 pt-0 border-t border-gray-100 dark:border-gray-700 mt-4">
              <Button
                onClick={() => {
                  closeModal();
                  openApprove(modal.donation);
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Setujui
              </Button>
              <Button
                onClick={() => {
                  closeModal();
                  openReject(modal.donation);
                }}
                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow"
              >
                <XCircle className="w-4 h-4 mr-2" /> Tolak
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <AdminNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Donasi Pending
              </h1>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Verifikasi dan setujui donasi yang masuk
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-2 border-amber-300 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 font-semibold px-4 py-2"
            >
              {donations.length} menunggu
            </Badge>
            <Button
              variant="outline"
              onClick={loadDonations}
              disabled={loading}
              className="border-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 font-semibold dark:bg-gray-800"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {donations.length === 0 ? (
          <Card className="border-2 dark:border-gray-800 shadow-2xl dark:bg-gray-800/50">
            <CardContent className="text-center py-16">
              <div className="inline-block p-5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50 rounded-3xl mb-6">
                <CheckCircle2 className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3">
                Semua Donasi Sudah Diproses
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto">
                Tidak ada donasi pending saat ini. Donasi baru akan muncul di
                sini untuk diverifikasi.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 dark:border-gray-800 shadow-2xl overflow-hidden dark:bg-gray-800/50">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b-2 border-emerald-100 dark:border-emerald-900/30 pb-4">
              <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Daftar Donasi Pending
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Klik nama donatur atau tombol <strong className="dark:text-gray-300">Lihat Bukti</strong> untuk
                melihat bukti transfer sebelum menyetujui.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b-2 border-gray-100 dark:border-gray-800">
                      <th className="text-left px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                        No
                      </th>
                      <th className="text-left px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                        Donatur
                      </th>
                      <th className="text-left px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                        Kegiatan
                      </th>
                      <th className="text-right px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                        Nominal
                      </th>
                      <th className="text-left px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                        Tanggal
                      </th>
                      <th className="text-left px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                        Pesan
                      </th>
                      <th className="text-center px-5 py-3.5 font-black text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {(() => {
                      const totalPages = Math.ceil(donations.length / D_PER_PAGE);
                      const paginatedDonations = donations.slice((dPage - 1) * D_PER_PAGE, dPage * D_PER_PAGE);
                      return paginatedDonations.map((donation, index) => (
                      <tr
                        key={donation.id}
                        className="hover:bg-emerald-50/40 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                         <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 max-w-[180px] truncate">
                            {(dPage - 1) * D_PER_PAGE + index + 1}
                          </p>
                        </td>
                        {/* Donatur */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                                {donation.donor_name || "Anonim"}
                              </p>
                              {donation.user?.email && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3" />
                                  {donation.user.email}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Kegiatan */}
                        <td className="px-5 py-4">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 max-w-[180px] truncate">
                            {donation.kegiatan?.title || "—"}
                          </p>
                        </td>

                        {/* Nominal */}
                        <td className="px-5 py-4 text-right">
                          <span className="font-black text-emerald-700 dark:text-emerald-400 text-base">
                            {formatCurrency(donation.amount)}
                          </span>
                        </td>

                        {/* Tanggal */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                            <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                            <span>{formatDate(donation.created_at)}</span>
                          </div>
                        </td>

                        {/* Pesan */}
                        <td className="px-5 py-4">
                          <p className="text-gray-500 dark:text-gray-400 max-w-[140px] truncate text-xs">
                            {donation.message || (
                              <span className="italic text-gray-300 dark:text-gray-600">—</span>
                            )}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPreview(donation)}
                              className="border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 font-semibold text-xs px-3 h-8"
                            >
                              <ImageIcon className="w-3.5 h-3.5 mr-1" />
                              Bukti
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openApprove(donation)}
                              disabled={processing === donation.id}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 h-8 shadow"
                            >
                              {processing === donation.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                  Setujui
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openReject(donation)}
                              disabled={processing === donation.id}
                              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 h-8 shadow"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Tolak
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))})()}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {(() => {
                const totalPages = Math.ceil(donations.length / D_PER_PAGE);
                if (donations.length === 0) return null;
                return (
                  <div className="border-t-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Tampilkan:</span>
                        <select
                          value={dPerPage}
                          onChange={(e) => {
                            setDPerPage(e.target.value === "ALL" ? "ALL" : Number(e.target.value));
                            setDPage(1);
                          }}
                          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold py-1 px-2 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 dark:text-gray-200 transition-all cursor-pointer shadow-sm"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                          <option value="ALL">Semua</option>
                        </select>
                      </div>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span className="text-gray-800 dark:text-gray-200">{(dPage - 1) * D_PER_PAGE + 1}</span>
                        {" – "}
                        <span className="text-gray-800 dark:text-gray-200">{Math.min(dPage * D_PER_PAGE, donations.length)}</span>
                        {" dari "}
                        <span className="text-gray-800 dark:text-gray-200">{donations.length}</span>
                        {" donasi"}
                      </p>
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setDPage(p => Math.max(1, p - 1))}
                        disabled={dPage === 1}
                        className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - dPage) <= 1)
                        .map((p, i, arr) => (
                          <div key={p} className="flex gap-1 items-center">
                            {i > 0 && p - arr[i - 1] > 1 && <span className="text-gray-400 dark:text-gray-500 font-bold px-1">...</span>}
                            <Button 
                              variant={dPage === p ? 'default' : 'outline'} 
                              size="sm"
                              onClick={() => setDPage(p)}
                              className={dPage === p 
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-black dark:bg-emerald-600 dark:hover:bg-emerald-700 border-none shadow-md h-8 w-8 p-0" 
                                : "border-2 font-bold text-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 h-8 w-8 p-0"}
                            >
                              {p}
                            </Button>
                          </div>
                        ))
                      }

                      <Button
                        variant="outline" size="sm"
                        onClick={() => setDPage(p => Math.min(totalPages, p + 1))}
                        disabled={dPage === totalPages}
                        className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
