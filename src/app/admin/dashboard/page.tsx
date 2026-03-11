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
  Users,
  Heart,
  DollarSign,
  HelpCircle,
  ClipboardList,
  Eye,
  Clock,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface DashboardStats {
  total_users: number;
  total_kegiatan: number;
  total_donations: number;
  pending_donations: number;
  total_donation_amount: number;
  total_ai_queries: number;
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
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

  const handleLogout = () => {
    logout();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b-2 border-emerald-100 sticky top-0 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Dashboard Admin
                </span>
                <p className="text-xs text-gray-500 font-medium">
                  Desa Cerdas Management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 animate-slide-in-right">
              <Link href="/admin/kegiatan">
                <Button
                  variant="ghost"
                  className="font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 relative group"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Kelola Kegiatan
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all"></span>
                </Button>
              </Link>
              <Link href="/admin/donasi">
                <Button
                  variant="ghost"
                  className="font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 relative group"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Donasi Masuk
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all"></span>
                </Button>
              </Link>
              <Link href="/kegiatan">
                <Button
                  variant="ghost"
                  className="font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 relative group"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat Website
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all"></span>
                </Button>
              </Link>
              <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{user.nama}</p>
                  <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs">
                    ADMIN
                  </Badge>
                </div>
                <Button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Card */}
        <Card className="border-2 shadow-2xl mb-10 overflow-hidden animate-fade-in-up animation-delay-200">
          <CardHeader className="bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 text-white p-10 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjA1IiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20"></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <CardTitle className="text-4xl font-black mb-3 text-white">
                  Selamat Datang, {user.nama}! 👋
                </CardTitle>
                <CardDescription className="text-emerald-100 text-lg font-medium">
                  Kelola sistem informasi desa dengan bijak dan transparan
                </CardDescription>
              </div>
              <div className="hidden lg:block">
                <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-white/30">
                  <TrendingUp className="w-16 h-16 text-white/80" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
            <Card className="border-2 border-l-4 border-l-blue-500 shadow-2xl hover:shadow-emerald-200 transition-all transform hover:scale-105 animate-fade-in-up animation-delay-300">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm font-black uppercase tracking-wide">
                    Total Warga
                  </p>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-1">
                  {stats.total_users}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  Pengguna terdaftar
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-l-4 border-l-teal-500 shadow-2xl hover:shadow-emerald-200 transition-all transform hover:scale-105 animate-fade-in-up animation-delay-350">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm font-black uppercase tracking-wide">
                    Kegiatan
                  </p>
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl shadow-lg">
                    <ClipboardList className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-teal-600 to-green-600 bg-clip-text text-transparent mb-1">
                  {stats.total_kegiatan}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  Kegiatan terdaftar
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-l-4 border-l-purple-500 shadow-2xl hover:shadow-emerald-200 transition-all transform hover:scale-105 animate-fade-in-up animation-delay-400">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm font-black uppercase tracking-wide">
                    Total Donasi
                  </p>
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">
                  {stats.total_donations}
                </p>
                <Badge className="bg-purple-100 text-purple-800 font-bold border-2 border-purple-200">
                  {stats.pending_donations} menunggu verifikasi
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-2 border-l-4 border-l-emerald-500 shadow-2xl hover:shadow-emerald-200 transition-all transform hover:scale-105 animate-fade-in-up animation-delay-500">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm font-black uppercase tracking-wide">
                    Dana Terkumpul
                  </p>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  {formatCurrency(stats.total_donation_amount)}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  Total donasi disetujui
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-l-4 border-l-amber-500 shadow-2xl hover:shadow-emerald-200 transition-all transform hover:scale-105 animate-fade-in-up animation-delay-600">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-gray-600 text-sm font-black uppercase tracking-wide">
                    Pertanyaan AI
                  </p>
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl shadow-lg">
                    <HelpCircle className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-4xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-1">
                  {stats.total_ai_queries}
                </p>
                <p className="text-sm text-gray-500 font-medium">
                  Pertanyaan diajukan
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8 animate-fade-in-up animation-delay-700">
          <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            Aksi Cepat
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/admin/donasi" className="group">
              <Card className="border-2 shadow-2xl hover:shadow-emerald-200 transition-all transform group-hover:scale-105 group-hover:border-emerald-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl group-hover:from-emerald-600 group-hover:to-teal-600 transition-all shadow-lg">
                      <Clock className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-emerald-600 transition-colors mb-1">
                        Donasi Pending
                      </h3>
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        Verifikasi donasi masuk
                      </p>
                      {stats && stats.pending_donations > 0 && (
                        <Badge className="bg-amber-100 text-amber-800 font-bold border-2 border-amber-200">
                          {stats.pending_donations} menunggu
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/kegiatan" className="group">
              <Card className="border-2 shadow-2xl hover:shadow-emerald-200 transition-all transform group-hover:scale-105 group-hover:border-emerald-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl group-hover:from-blue-600 group-hover:to-cyan-600 transition-all shadow-lg">
                      <ClipboardList className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                        Kelola Kegiatan
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">
                        Buat dan edit kegiatan desa
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/kegiatan" className="group">
              <Card className="border-2 shadow-2xl hover:shadow-emerald-200 transition-all transform group-hover:scale-105 group-hover:border-emerald-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-5">
                    <div className="p-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl group-hover:from-purple-600 group-hover:to-pink-600 transition-all shadow-lg">
                      <Eye className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-600 transition-colors mb-1">
                        Preview Website
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">
                        Lihat tampilan publik
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
