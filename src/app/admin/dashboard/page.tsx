"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Heart,
  DollarSign,
  HelpCircle,
  ClipboardList,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Loader2,
  Activity,
  ChevronLeft,
  ChevronRight,
  Shield,
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
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

interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  description: string;
  created_at: string;
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
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logPage, setLogPage] = useState(1);
  const LOG_PER_PAGE = 10;
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"donasi" | "kegiatan" | null>(
    null,
  );

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
    // Load logs
    try {
      setLogsLoading(true);
      const logRes = await adminService.getActivityLogs(100);
      setLogs(logRes.data ?? logRes ?? []);
    } catch {
      // silent
    } finally {
      setLogsLoading(false);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/kegiatan`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const json = await res.json();
      const data: any[] = Array.isArray(json.data)
        ? json.data
        : (json.data?.data ?? []);

      const headers = [
        "ID",
        "Judul",
        "Status",
        "Target (Rp)",
        "Terkumpul (Rp)",
        "Tanggal Mulai",
        "Tanggal Selesai",
      ];
      const rows = data.map((k: any) => [
        k.id,
        `"${k.title}"`,
        k.status,
        k.target_amount,
        k.current_amount,
        k.start_date ? new Date(k.start_date).toLocaleDateString("id-ID") : "-",
        k.end_date ? new Date(k.end_date).toLocaleDateString("id-ID") : "-",
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n",
      );
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
        {
          name: "Kegiatan",
          value: stats.total_kegiatan,
          color: CHART_COLORS[1],
        },
        {
          name: "Donasi OK",
          value: stats.total_donations,
          color: CHART_COLORS[2],
        },
        {
          name: "Pending",
          value: stats.pending_donations,
          color: CHART_COLORS[3],
        },
        {
          name: "Pertanyaan AI",
          value: stats.total_ai_queries,
          color: CHART_COLORS[4],
        },
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
        {
          label: "Total Warga",
          value: stats.total_users,
          icon: Users,
          gradient: "from-blue-500 to-cyan-500",
          textGradient: "from-blue-600 to-cyan-600",
          border: "border-l-blue-500",
        },
        {
          label: "Kegiatan",
          value: stats.total_kegiatan,
          icon: ClipboardList,
          gradient: "from-teal-500 to-green-500",
          textGradient: "from-teal-600 to-green-600",
          border: "border-l-teal-500",
        },
        {
          label: "Total Donasi",
          value: stats.total_donations,
          icon: Heart,
          gradient: "from-purple-500 to-pink-500",
          textGradient: "from-purple-600 to-pink-600",
          border: "border-l-purple-500",
          badge: `${stats.pending_donations} pending`,
        },
        {
          label: "Dana Terkumpul",
          value: formatRupiah(stats.total_donation_amount),
          icon: DollarSign,
          gradient: "from-emerald-500 to-teal-500",
          textGradient: "from-emerald-600 to-teal-600",
          border: "border-l-emerald-500",
          small: true,
        },
        {
          label: "Pertanyaan AI",
          value: stats.total_ai_queries,
          icon: HelpCircle,
          gradient: "from-amber-500 to-yellow-500",
          textGradient: "from-amber-600 to-yellow-600",
          border: "border-l-amber-500",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-900/30 relative overflow-hidden transition-colors">
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
                <Card
                  key={i}
                  className={`border-2 border-l-4 ${stat.border} shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1`}
                >
                  <CardContent className="p-4 md:p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-black uppercase tracking-wide leading-tight">
                        {stat.label}
                      </p>
                      <div
                        className={`p-2 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-md shrink-0`}
                      >
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p
                      className={`${stat.small ? "text-sm md:text-lg" : "text-2xl md:text-3xl"} font-black bg-gradient-to-r ${stat.textGradient} dark:${stat.textGradient.replace(/600/g, "400").replace(/500/g, "400")} bg-clip-text text-transparent leading-tight`}
                    >
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
            <Card className="border-2 border-emerald-100 dark:border-emerald-900/50 shadow-xl xl:col-span-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Ringkasan Data
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Perbandingan data utama dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={barData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0fdf4"
                      className="dark:opacity-10"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                        fontWeight: 600,
                        fill: "currentColor",
                      }}
                    />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "2px solid #d1fae5",
                        fontWeight: 600,
                      }}
                      formatter={(value: any) => [
                        Number(value).toLocaleString("id-ID"),
                        "Jumlah",
                      ]}
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
            <Card className="border-2 border-emerald-100 dark:border-emerald-900/50 shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Status Donasi
                </CardTitle>
                <CardDescription className="dark:text-gray-400">
                  Distribusi donasi masuk
                </CardDescription>
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
                    <Tooltip
                      formatter={(value: any) => [
                        Number(value).toLocaleString("id-ID"),
                        "",
                      ]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Export Section */}
        <Card className="border-2 border-emerald-100 dark:border-emerald-900/50 shadow-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Export Laporan
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Unduh data dalam format Excel / CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Export Donasi */}
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-100 dark:border-purple-800/50 rounded-2xl">
                <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-gray-100">
                    Data Donasi
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Semua transaksi masuk
                  </p>
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
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-100 dark:border-emerald-800/50 rounded-2xl">
                <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-md shrink-0">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-gray-900 dark:text-gray-100 text-sm">
                    Data Kegiatan
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Seluruh kegiatan tercatat (CSV)
                  </p>
                </div>
                <Button
                  onClick={handleExportKegiatan}
                  disabled={exporting !== null}
                  variant="outline"
                  className="w-full sm:w-auto bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm"
                >
                  {exporting === "kegiatan" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Section */}
        <Card className="border-2 border-emerald-100 dark:border-emerald-900/50 shadow-xl overflow-hidden bg-white/50 dark:bg-gray-900/50 backdrop-blur">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Aktivitas Terakhir
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Log operasional sistem admin
              </CardDescription>
            </div>

            <button
              onClick={loadStats}
              className="p-2 rounded-xl hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 transition-all"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </CardHeader>

          <CardContent className="p-0">
            {logsLoading ? (
              <div className="flex items-center justify-center py-16 gap-3">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                <span className="text-gray-500 font-medium text-sm">
                  Memuat log...
                </span>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Activity className="w-10 h-10 text-gray-300" />
                <p className="text-gray-400 font-medium text-sm">
                  Belum ada log aktivitas
                </p>
              </div>
            ) : (
              (() => {
                const paginatedLogs = logs.slice(
                  (logPage - 1) * LOG_PER_PAGE,
                  logPage * LOG_PER_PAGE,
                );

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50/80 dark:bg-gray-800/80 border-b-2 border-gray-100 dark:border-gray-800">
                          <th className="text-left px-5 py-3 font-bold text-gray-600 dark:text-gray-300">
                            Waktu
                          </th>
                          <th className="text-left px-5 py-3 font-bold text-gray-600 dark:text-gray-300">
                            Aksi
                          </th>
                          <th className="text-left px-5 py-3 font-bold text-gray-600 dark:text-gray-300">
                            Deskripsi
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {paginatedLogs.map((log) => {
                          const date = new Date(
                            log.created_at,
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          });

                          const time = new Date(
                            log.created_at,
                          ).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          let badgeStyle =
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";

                          let ActionIcon = Shield;

                          if (log.action.includes("CREATE")) {
                            badgeStyle =
                              "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50";
                            ActionIcon = Plus;
                          } else if (
                            log.action.includes("UPDATE") ||
                            log.action.includes("APPROVE") ||
                            log.action.includes("REJECT")
                          ) {
                            badgeStyle =
                              "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50";
                            ActionIcon = Pencil;
                          } else if (log.action.includes("DELETE")) {
                            badgeStyle =
                              "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50";
                            ActionIcon = Trash2;
                          }

                          return (
                            <tr
                              key={log.id}
                              className="hover:bg-emerald-50/30 dark:hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="px-5 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                {date}
                                <span className="text-xs ml-1 opacity-70">
                                  {time}
                                </span>
                              </td>

                              <td className="px-5 py-3 whitespace-nowrap">
                                <Badge
                                  variant="outline"
                                  className={`font-semibold flex items-center w-fit gap-1.5 ${badgeStyle}`}
                                >
                                  <ActionIcon className="w-3 h-3" />
                                  {log.action}
                                </Badge>
                              </td>

                              <td className="px-5 py-3">
                                <p
                                  className="text-gray-700 dark:text-gray-300 line-clamp-2"
                                  title={log.description}
                                >
                                  {log.description}
                                </p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            )}

            {/* Pagination */}
            {(() => {
              const totalPageLogs = Math.ceil(logs.length / LOG_PER_PAGE);
              if (totalPageLogs <= 1) return null;

              return (
                <div className="border-t-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 px-5 py-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    <span className="text-gray-800 dark:text-gray-200">
                      {(logPage - 1) * LOG_PER_PAGE + 1}
                    </span>{" "}
                    –{" "}
                    <span className="text-gray-800 dark:text-gray-200">
                      {Math.min(logPage * LOG_PER_PAGE, logs.length)}
                    </span>{" "}
                    dari{" "}
                    <span className="text-gray-800 dark:text-gray-200">
                      {logs.length}
                    </span>{" "}
                    log
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                      disabled={logPage === 1}
                      className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg w-8 h-8 flex items-center justify-center">
                      {logPage}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLogPage((p) => Math.min(totalPageLogs, p + 1))
                      }
                      disabled={logPage === totalPageLogs}
                      className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
