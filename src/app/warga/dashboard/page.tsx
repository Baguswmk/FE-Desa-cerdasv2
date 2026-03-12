"use client";

import { useEffect, useState } from "react";
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
import {
  Home,
  Heart,
  Sprout,
  LogOut,
  PlusCircle,
  Calendar,
  User,
  Eye,
  TrendingUp,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { donasiService } from "@/services/donasi.service";
import { smartFarmService } from "@/services/smartfarm.service";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { Donation, SmartFarm } from "@/types";
import { ThemeToggle } from "@/components/theme-toggle";

export default function WargaDashboardPage() {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [farms, setFarms] = useState<SmartFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dPage, setDPage] = useState(1);
  const [dPerPage, setDPerPage] = useState<number | "ALL">(10);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [donationsRes, farmsRes] = await Promise.all([
        donasiService.getMyDonations(),
        smartFarmService.getUserFarms(),
      ]);

      setDonations(donationsRes.data || []);
      setFarms(farmsRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; label: string }> = {
      PENDING: {
        className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800",
        label: "Menunggu",
      },
      APPROVED: {
        className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800",
        label: "Disetujui",
      },
      REJECTED: {
        className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800",
        label: "Ditolak",
      },
    };
    const style = config[status] ?? {
      className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
      label: status,
    };
    return (
      <Badge className={`${style.className} border-2 font-bold`}>
        {style.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || !user) {
    return <LoadingScreen message="Memuat dashboard..." />;
  }

  const D_PER_PAGE = dPerPage === "ALL" ? donations.length || 1 : dPerPage;
  const totalDonationPages = Math.ceil(donations.length / D_PER_PAGE);
  const paginatedDonations = donations.slice((dPage - 1) * D_PER_PAGE, dPage * D_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-950 dark:to-emerald-950/20 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b-2 border-emerald-100 dark:border-gray-800 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white dark:border-gray-900"></div>
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Dashboard Warga
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Desa Cerdas</p>
              </div>
            </div>
            <div className="flex items-center gap-4 animate-slide-in-right">
              <Link href="/kegiatan" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Kegiatan
                </Button>
              </Link>
              <Link href="/smartfarm" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800"
                >
                  <Sprout className="w-4 h-4 mr-2" />
                  Smart Farm
                </Button>
              </Link>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-gray-300 dark:border-gray-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{user.nama}</p>
                  <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs">
                    WARGA
                  </Badge>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-sm px-3 sm:px-4"
                >
                  <LogOut className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Card */}
        <Card className="dark:bg-gray-900/40 dark:border-gray-800 border-2 shadow-2xl mb-10 overflow-hidden animate-fade-in-up animation-delay-200">
          <CardHeader className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900 text-white p-10 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
            <div className="relative z-10">
              <CardTitle className="text-4xl font-black mb-3 text-white">
                Selamat Datang, {user.nama}! 👋
              </CardTitle>
              <CardDescription className="text-emerald-100 dark:text-emerald-200 text-lg font-medium">
                Kelola donasi dan tanaman Anda dengan mudah
              </CardDescription>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <Card className="dark:bg-gray-900/60 dark:border-gray-800 border-2 shadow-2xl hover:shadow-emerald-200 dark:hover:shadow-emerald-900/50 transition-all animate-fade-in-up animation-delay-300">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Total Donasi Saya
                  </p>
                  <p className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                    {donations.length}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 border-2 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800 font-bold">
                  {donations.filter((d) => d.status === "APPROVED").length}{" "}
                  disetujui
                </Badge>
                <Badge className="bg-amber-100 text-amber-800 border-2 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800 font-bold">
                  {donations.filter((d) => d.status === "PENDING").length}{" "}
                  pending
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-900/60 dark:border-gray-800 border-2 shadow-2xl hover:shadow-emerald-200 dark:hover:shadow-emerald-900/50 transition-all animate-fade-in-up animation-delay-400">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Data Tanaman
                  </p>
                  <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    {farms.length}
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-lg">
                  <Sprout className="w-10 h-10 text-white" />
                </div>
              </div>
              <Link href="/smartfarm">
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Tambah Tanaman
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* My Donations Section */}
        <Card className="dark:bg-gray-900/60 dark:border-gray-800 border-2 shadow-2xl mb-10 animate-fade-in-up animation-delay-500">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800/80 border-b-2 border-emerald-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
                  Riwayat Donasi Saya
                </CardTitle>
                <CardDescription className="text-base dark:text-gray-400">
                  Donasi yang telah Anda berikan
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-8">
            {donations.length === 0 ? (
              <div className="text-center py-16 p-4">
                <div className="inline-block p-5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl mb-6 animate-bounce-in">
                  <Heart className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3">
                  Belum Ada Donasi
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto mb-6">
                  Mulai berbagi kebaikan dengan memberikan donasi untuk kegiatan
                  desa
                </p>
                <Link href="/kegiatan">
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Lihat Kegiatan Desa
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-emerald-100 dark:border-gray-800">
                      <th className="text-left p-4 font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm w-12">
                        No
                      </th>
                      <th className="text-left p-4 font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                        Kegiatan
                      </th>
                      <th className="text-left p-4 font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                        Jumlah
                      </th>
                      <th className="text-left p-4 font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                        Tanggal
                      </th>
                      <th className="text-left p-4 font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDonations.map((donation, index) => (
                       <tr
                        key={donation.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-emerald-50/50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-semibold text-gray-500 dark:text-gray-400 text-sm">
                            {(dPage - 1) * D_PER_PAGE + index + 1}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            {donation.kegiatan?.title || "N/A"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {donation.donor_name || "Anonim"}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="font-black text-emerald-600 dark:text-emerald-400 text-lg">
                            {formatCurrency(donation.amount)}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">
                              {new Date(donation.created_at).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(donation.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {donations.length > 0 && (() => {
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

                  {totalDonationPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline" size="sm"
                        onClick={() => setDPage(p => Math.max(1, p - 1))}
                        disabled={dPage === 1}
                        className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>

                      {Array.from({ length: totalDonationPages }, (_, i) => i + 1)
                        .filter(p => totalDonationPages <= 5 || p === 1 || p === totalDonationPages || Math.abs(p - dPage) <= 1)
                        .map((p, i, arr) => (
                          <div key={p} className="flex gap-1 items-center">
                            {i > 0 && p - arr[i - 1] > 1 && <span className="text-gray-400 dark:text-gray-500 font-bold px-1">...</span>}
                            <Button
                              variant={dPage === p ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setDPage(p)}
                              className={dPage === p
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white font-black dark:bg-emerald-600 dark:hover:bg-emerald-700 border-none shadow-md h-8 w-8 p-0"
                                : "border-2 font-bold text-gray-600 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 h-8 w-8 p-0"}
                            >
                              {p}
                            </Button>
                          </div>
                        ))
                      }

                      <Button
                        variant="outline" size="sm"
                        onClick={() => setDPage(p => Math.min(totalDonationPages, p + 1))}
                        disabled={dPage === totalDonationPages}
                        className="border-2 font-bold h-8 w-8 p-0 dark:border-gray-700 dark:hover:bg-gray-800"
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

        {/* My Farms Section */}
        <Card className="dark:bg-gray-900/60 dark:border-gray-800 border-2 shadow-2xl animate-fade-in-up animation-delay-600">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800/80 border-b-2 border-emerald-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
                    Tanaman Saya
                  </CardTitle>
                  <CardDescription className="text-base dark:text-gray-400">
                    Data tanaman yang dikelola dengan Smart Farm AI
                  </CardDescription>
                </div>
              </div>
              <Link href="/smartfarm">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tambah</span>
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-8">
            {farms.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-5 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-3xl mb-6 animate-bounce-in">
                  <Sprout className="w-16 h-16 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-3">
                  Belum Ada Data Tanaman
                </h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto mb-6">
                  Mulai kelola tanaman dengan bantuan AI untuk hasil yang lebih
                  baik
                </p>
                <Link href="/smartfarm">
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Mulai Smart Farm
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.slice(0, 3).map((farm, index) => (
                  <Card
                    key={farm.id}
                    className={`border-2 dark:border-gray-800 dark:bg-gray-800 hover:shadow-lg transition-all animate-scale-in animation-delay-${(index + 7) * 100}`}
                  >
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-800 text-white p-5">
                      <CardTitle className="text-xl font-black">
                        {farm.crop_type}
                      </CardTitle>
                      <CardDescription className="text-emerald-100 dark:text-emerald-200 font-medium flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {farm.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5">
                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                            Luas Area
                          </span>
                          <span className="font-black text-gray-900 dark:text-gray-100">
                            {farm.area_size} m²
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                            Jenis Tanah
                          </span>
                          <span className="font-black text-gray-900 dark:text-gray-100 capitalize">
                            {farm.soil_type}
                          </span>
                        </div>
                      </div>
                      {farm.ai_recommendation && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-900 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            <p className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase">
                              Rekomendasi AI
                            </p>
                          </div>
                          <p className="text-sm text-emerald-900 dark:text-emerald-400 line-clamp-2 font-medium">
                            {farm.ai_recommendation}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {farms.length > 3 && (
              <div className="text-center mt-6">
                <Link href="/smartfarm">
                  <Button
                    variant="outline"
                    className="border-2 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold"
                  >
                    Lihat Semua Tanaman ({farms.length})
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
