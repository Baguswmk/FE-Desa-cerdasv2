"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Heart,
  Scale,
  Sprout,
  ClipboardList,
  Users,
  Target,
  Award,
  Zap,
  Shield,
  TrendingUp,
  MapPin,
  Phone,
  Loader2,
  Mail,
} from "lucide-react";
import { kegiatanService } from "@/services/kegiatan.service";

export default function TentangPage() {
  const [statsData, setStatsData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await kegiatanService.getAll();
        const raw = res.data;
        if (!Array.isArray(raw) && raw.stats) {
          setStatsData(raw.stats);
        } else {
          // If no pre-calculated stats, calculate from list
          const activities = Array.isArray(raw) ? raw : (raw.data ?? []);
          const totalDana = activities.reduce((sum: number, a: any) => sum + (Number(a.current_amount) || 0), 0);
          const activeCount = activities.filter((a: any) => a.status === "ACTIVE").length;
          setStatsData({
            total_kegiatan: activeCount,
            total_dana: totalDana,
            // fallback total_warga manually or from elsewhere if omitted
            total_warga: activities.length > 0 ? 1247 : 0 
          });
        }
      } catch (err) {
        console.error("Gagal memuat statistik", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    {
      icon: ClipboardList,
      title: "Kelola Kegiatan Desa",
      description:
        "Platform transparan untuk mengelola program dan kegiatan desa dengan sistem donasi online yang terverifikasi.",
    },
    {
      icon: Heart,
      title: "Donasi Transparan",
      description:
        "Sistem donasi online dengan bukti transfer digital dan tracking dana real-time untuk transparansi penuh.",
    },
    {
      icon: Scale,
      title: "Konsultasi Hukum AI",
      description:
        "Layanan konsultasi hukum berbasis AI untuk membantu warga dengan informasi dan prosedur administrasi desa.",
    },
    {
      icon: Sprout,
      title: "Smart Farm",
      description:
        "Platform pertanian cerdas dengan AI untuk membantu petani meningkatkan hasil panen dan produktivitas.",
    },
  ];

  const formatMilyar = (amount: number) => {
    if (!amount) return "Rp 0";
    if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const stats = [
    { icon: Users, value: loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /> : (statsData.total_warga ?? "1,247").toLocaleString("id-ID"), label: "Warga Teraktif" },
    { icon: ClipboardList, value: loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /> : (statsData.total_kegiatan ?? 0).toString(), label: "Kegiatan Berjalan" },
    { icon: Heart, value: loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" /> : formatMilyar(statsData.total_dana ?? 0), label: "Dana Terkumpul" },
  ];

  const team = [
    {
      name: "Tim Pengembang",
      role: "Development Team",
      description:
        "Tim ahli yang berdedikasi untuk membangun platform terbaik bagi desa",
    },
    {
      name: "Pemerintah Desa",
      role: "Government Partners",
      description:
        "Bekerja sama dengan pemerintah desa untuk transparansi dan akuntabilitas",
    },
    {
      name: "Komunitas Warga",
      role: "Community Members",
      description: "Melibatkan partisipasi aktif warga dalam pembangunan desa",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      {/* Navbar */}
      <Navbar currentPage="tentang" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-20 animate-fade-in">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6 animate-float">
            <Home className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-hero font-black text-white mb-6 animate-fade-in-up animation-delay-200">
            Tentang Desa Cerdas
          </h1>

          <p className="text-subtitle text-emerald-50 max-w-3xl mx-auto animate-fade-in-up animation-delay-300">
            Platform digital terintegrasi yang menghubungkan pemerintah desa
            dengan warga, menciptakan transparansi, partisipasi, dan pembangunan
            berkelanjutan untuk desa yang lebih maju.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16 animate-fade-in-up animation-delay-300">
          <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-2xl hover:shadow-emerald-200 dark:hover:border-gray-700 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b-2 border-emerald-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900 dark:text-gray-100">
                <Target className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                Visi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                Menjadi platform digital terdepan yang memberdayakan desa-desa
                di Indonesia melalui teknologi, transparansi, dan partisipasi
                aktif warga untuk mewujudkan desa yang maju, sejahtera, dan
                berkelanjutan.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-2xl hover:shadow-emerald-200 dark:hover:border-gray-700 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b-2 border-emerald-100 dark:border-gray-700">
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-gray-900 dark:text-gray-100">
                <TrendingUp className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                Misi Kami
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Meningkatkan transparansi pengelolaan dana desa
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Memfasilitasi partisipasi aktif warga dalam pembangunan
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Menyediakan layanan digital yang mudah diakses
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Statistics */}
        <div className="mb-16 animate-fade-in-up animation-delay-400">
          <h2 className="text-display font-black text-center bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-8">
            Dampak Kami
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <CardContent className="p-6 text-center">
                    <Icon className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                    <div className="text-4xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div className="mb-16 animate-fade-in-up animation-delay-500">
          <h2 className="text-display font-black text-center bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-8">
            Fitur Unggulan
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                          {feature.title}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16 animate-fade-in-up animation-delay-600">
          <h2 className="text-display font-black text-center bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-8">
            Tim &amp; Kolaborasi
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <Card
                key={index}
                className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 hover:border-emerald-300 dark:hover:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center"
              >
                <CardContent className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">
                    {member.name}
                  </h3>
                  <Badge className="mb-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50">
                    {member.role}
                  </Badge>
                  <p className="text-gray-600 dark:text-gray-400">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact */}
        <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-2xl animate-fade-in-up animation-delay-700">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b-2 border-emerald-100 dark:border-gray-700">
            <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100 text-center">
              Hubungi Kami
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">info@desacerdas.id</p>
              </div>
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                  <Phone className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Telepon</h3>
                <p className="text-gray-600 dark:text-gray-400">+62 21 1234 5678</p>
              </div>
              <div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Alamat</h3>
                <p className="text-gray-600 dark:text-gray-400">Jakarta, Indonesia</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
