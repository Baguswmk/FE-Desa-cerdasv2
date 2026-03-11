"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Heart, DollarSign, HelpCircle, ClipboardList,
  TrendingUp, Download, FileSpreadsheet, Loader2,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import AdminNavbar from "@/components/AdminNavbar";

interface DashboardStats {
  total_users: number;
  total_kegiatan: number;
  total_donations: number;
  pending_donations: number;
  total_donation_amount: number;
  total_ai_queries: number;
}

const CHART_COLORS = ["#10b981", "#14b8a6", "#6366f1", "#f59e0b", "#ef4444"];

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"donasi" | "kegiatan" | null>(null);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDonasi = async () => {
    setExporting("donasi");
    try {
      await adminService.exportDonations("excel", "ALL");
    } catch (e) {
      alert("Gagal export donasi");
    } finally {
      setExporting(null);
    }
  };

  const handleExportKegiatan = async () => {
    setExporting("kegiatan");
    try {
      // Fetch all kegiatan and export as CSV client-side
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/kegiatan`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const json = await res.json();
      const data: any[] = Array.isArray(json.data) ? json.data : (json.data?.data ?? []);

      const headers = ["ID", "Judul", "Status", "Target (Rp)", "Terkumpul (Rp)", "Tanggal Mulai", "Tanggal Selesai"];
      const rows = data.map((k: any) => [
        k.id,
        `"${k.title}"`,
        k.status,
        k.target_amount,
        k.current_amount,
        k.start_date ? new Date(k.start_date).toLocaleDateString("id-ID") : "-",
        k.end_date ? new Date(k.end_date).toLocaleDateString("id-ID") : "-",
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kegiatan-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Gagal export kegiatan");
    } finally {
      setExporting(null);
    }
  };

  if (loading || !user) return <LoadingScreen message="Memuat dashboard..." />;

  // ── Chart data ────────────────────────────────────────────────────────────
  const barData = stats
    ? [
        { name: "Warga", value: stats.total_users, color: CHART_COLORS[0] },
        { name: "Kegiatan", value: stats.total_kegiatan, color: CHART_COLORS[1] },
        { name: "Donasi OK", value: stats.total_donations, color: CHART_COLORS[2] },
        { name: "Pending", value: stats.pending_donations, color: CHART_COLORS[3] },
        { name: "Pertanyaan AI", value: stats.total_ai_queries, color: CHART_COLORS[4] },
      ]
    : [];

  const pieData = stats
    ? [
        { name: "Donasi Disetujui", value: stats.total_donations },
        { name: "Donasi Pending", value: stats.pending_donations },
      ]
    : [];

  const statsCards = stats
    ? [
        { label: "Total Warga", value: stats.total_users, icon: Users, gradient: "from-blue-500 to-cyan-500", textGradient: "from-blue-600 to-cyan-600", border: "border-l-blue-500" },
        { label: "Kegiatan", value: stats.total_kegiatan, icon: ClipboardList, gradient: "from-teal-500 to-green-500", textGradient: "from-teal-600 to-green-600", border: "border-l-teal-500" },
        { label: "Total Donasi", value: stats.total_donations, icon: Heart, gradient: "from-purple-500 to-pink-500", textGradient: "from-purple-600 to-pink-600", border: "border-l-purple-500", badge: `${stats.pending_donations} pending` },
        { label: "Dana Terkumpul", value: formatRupiah(stats.total_donation_amount), icon: DollarSign, gradient: "from-emerald-500 to-teal-500", textGradient: "from-emerald-600 to-teal-600", border: "border-l-emerald-500", small: true },
        { label: "Pertanyaan AI", value: stats.total_ai_queries, icon: HelpCircle, gradient: "from-amber-500 to-yellow-500", textGradient: "from-amber-600 to-yellow-600", border: "border-l-amber-500" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000" />
      </div>

      <AdminNavbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">

        {/* Welcome banner */}
        <Card className="border-2 shadow-2xl overflow-hidden animate-fade-in-up animation-delay-200">
          <CardHeader className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white p-6 md:p-10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-2xl md:text-4xl font-black mb-2 text-white">
                  Selamat Datang, {user.nama}! 👋
                </CardTitle>
                <CardDescription className="text-emerald-100 text-sm md:text-lg font-medium">
                  Kelola sistem informasi desa dengan bijak dan transparan
                </CardDescription>
              </div>
              <div className="hidden lg:block ml-6 shrink-0">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30">
                  <TrendingUp className="w-12 h-12 text-white/80" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {statsCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <Card key={i} className={`border-2 border-l-4 ${stat.border} shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1`}>
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-500 text-xs font-black uppercase tracking-wide leading-tight">{stat.label}</p>
                      <div className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className={`${stat.small ? "text-sm md:text-lg" : "text-2xl md:text-3xl"} font-black bg-gradient-to-r ${stat.textGradient} bg-clip-text text-transparent leading-tight`}>
                      {stat.value}
                    </p>
                    {stat.badge && (
                      <Badge className="mt-1 bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold">
                        {stat.badge}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Analytics Charts */}
        {stats && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Bar Chart */}
            <Card className="border-2 border-emerald-100 shadow-xl xl:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Ringkasan Data
                </CardTitle>
                <CardDescription>Perbandingan data utama dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0fdf4" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "2px solid #d1fae5", fontWeight: 600 }}
                      formatter={(value: any) => [Number(value).toLocaleString("id-ID"), "Jumlah"]}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart */}
            <Card className="border-2 border-emerald-100 shadow-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Status Donasi
                </CardTitle>
                <CardDescription>Distribusi donasi masuk</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx * 2]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [Number(value).toLocaleString("id-ID"), ""]} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Section */}
        <Card className="border-2 border-emerald-100 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Export Laporan
            </CardTitle>
            <CardDescription>Unduh data dalam format Excel / CSV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Export Donasi */}
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-purple-50 border-2 border-purple-100 rounded-2xl">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">Daftar Donasi</p>
                  <p className="text-xs text-gray-500">Semua transaksi donasi (Excel)</p>
                </div>
                <Button
                  onClick={handleExportDonasi}
                  disabled={exporting === "donasi"}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow shrink-0"
                >
                  {exporting === "donasi" ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                  )}
                  Download
                </Button>
              </div>

              {/* Export Kegiatan */}
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-teal-50 border-2 border-teal-100 rounded-2xl">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 text-sm">Daftar Kegiatan</p>
                  <p className="text-xs text-gray-500">Semua kegiatan desa (CSV)</p>
                </div>
                <Button
                  onClick={handleExportKegiatan}
                  disabled={exporting === "kegiatan"}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold shadow shrink-0"
                >
                  {exporting === "kegiatan" ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-4 h-4 mr-1" />
                  )}
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
