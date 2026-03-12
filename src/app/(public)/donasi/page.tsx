"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Heart,
  Scale,
  Sprout,
  ClipboardList,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { kegiatanService } from "@/services/kegiatan.service";

interface Kegiatan {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: string;
  banner: string | null;
  photos: string[];
  category?: string;
  start_date: string;
  end_date: string | null;
}

interface Stats {
  total_warga?: number;
  total_kegiatan?: number;
  total_dana?: number;
}




export default function DonasiPage() {
  const [activities, setActivities] = useState<Kegiatan[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number | "ALL">(10);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await kegiatanService.getAll();
      // support both { data: [] } and { data: { data: [], stats: {} } }
      const raw = res.data;
      if (Array.isArray(raw)) {
        setActivities(raw);
      } else {
        setActivities(raw.data ?? []);
        setStats(raw.stats ?? {});
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat data kegiatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const calculateProgress = (current: number, target: number) =>
    Math.min((current / target) * 100, 100);

  const getImageUrl = (photo: string) =>
    `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "")}/uploads/${photo}`;



  const totalDana = activities.reduce((sum, a) => sum + a.current_amount, 0);
  const activeCount = activities.filter((a) => a.status === "ACTIVE").length;

  // Filter & Pagination Logic
  const filteredActivities = activities.filter((activity) =>
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ITEMS_PER_PAGE = itemsPerPage === "ALL" ? filteredActivities.length || 1 : itemsPerPage;
  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950 dark:via-teal-950 dark:to-green-950 transition-colors duration-300">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]"></div>
      </div>

      <Navbar currentPage="donasi" />


      {/* ── ACTIVITIES ── */}
      <section className="py-16 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-display font-black mb-4 bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Daftar Donasi & Kegiatan
            </h2>
            <p className="text-subtitle text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Temukan dan dukung berbagai kegiatan desa yang membutuhkan uluran tangan Anda.
              Setiap donasi disalurkan secara transparan.
            </p>
          </div>



          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400 font-semibold">Memuat kegiatan...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500 dark:text-red-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 font-semibold">{error}</p>
              <Button
                onClick={loadData}
                variant="outline"
                className="border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-600 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && activities.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-400 font-semibold">Belum ada kegiatan tersedia.</p>
            </div>
          )}

          {/* Search Bar */}
          {!loading && !error && activities.length > 0 && (
            <div className="max-w-xl mx-auto mb-10">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Cari kegiatan, kategori, atau deskripsi..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full pl-11 pr-4 py-3 border-2 border-emerald-100 dark:border-emerald-900/50 rounded-2xl leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-500 transition-all shadow-sm group-hover:shadow-md"
                />
              </div>
            </div>
          )}

          {/* Activities Grid */}
          {!loading && !error && activities.length > 0 && (
            <>
            {paginatedActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedActivities.map((activity) => (
                 <Link key={activity.id} href={`/kegiatan/${activity.id}`}>
                  <Card
                  className="group overflow-hidden border-2 border-emerald-100 dark:border-emerald-900 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-2xl dark:hover:shadow-emerald-900/20 transition-all duration-500 transform hover:-translate-y-2 bg-white dark:bg-gray-800"
                >
                  {/* Image */}
                  <div className="relative overflow-hidden h-56 bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-900 dark:to-teal-900">
                    {activity.banner ? (
                      <img
                        src={getImageUrl(activity.banner)}
                        alt={activity.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : activity.photos && activity.photos.length > 0 ? (
                      <img
                        src={getImageUrl(activity.photos[0])}
                        alt={activity.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Home className="w-16 h-16 text-white/30 dark:text-white/10" />
                      </div>
                    )}
                    {activity.category && (
                      <Badge className="absolute top-4 left-4 bg-emerald-600 dark:bg-emerald-700 text-white font-semibold shadow-lg">
                        {activity.category}
                      </Badge>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {activity.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
                      {activity.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Terkumpul</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {formatCurrency(activity.current_amount)}
                        </span>
                      </div>
                      <Progress
                        value={calculateProgress(activity.current_amount, activity.target_amount)}
                        className="h-3 dark:bg-gray-700"
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          Target: {formatCurrency(activity.target_amount)}
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {Math.round(calculateProgress(activity.current_amount, activity.target_amount))}%
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between items-center pt-0">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(activity.start_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <Button
                      onClick={(e) => e.preventDefault()}
                      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-700 dark:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 text-white font-bold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all cursor-pointer"
                    >
                      <Heart className="w-4 h-4 mr-1.5" />
                      Donasi
                    </Button>
                  </CardFooter>
                </Card>
              </Link>))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Pencarian Tidak Ditemukan</h3>
                <p className="text-gray-500 dark:text-gray-400">Kami tidak menemukan kegiatan yang sesuai dengan kata kunci "{searchQuery}"</p>
              </div>
            )}

            {/* Pagination Controls */}
            {(() => {
              if (filteredActivities.length === 0) return null;
              return (
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-12 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tampilkan:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(e.target.value === "ALL" ? "ALL" : Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white/50 dark:bg-gray-800/50 border-2 border-emerald-100 dark:border-gray-700 text-sm font-bold text-emerald-800 dark:text-emerald-400 rounded-xl px-3 py-1.5 outline-none focus:border-emerald-500 transition-all cursor-pointer backdrop-blur-sm"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="ALL">Semua</option>
                    </select>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="rounded-xl border-2 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 w-10 h-10 p-0"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(p => totalPages <= 5 || p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                          .map((page, i, arr) => (
                            <div key={page} className="flex gap-1 items-center">
                              {i > 0 && page - arr[i - 1] > 1 && <span className="text-gray-400 dark:text-gray-500 font-bold px-1">...</span>}
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 p-0 rounded-xl font-bold transition-all ${
                                  currentPage === page 
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md border-transparent" 
                                    : "border-2 hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:hover:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                              >
                                {page}
                              </Button>
                            </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="rounded-xl border-2 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300 w-10 h-10 p-0"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })()}
            </>
          )}
        </div>
      </section>



      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white dark:bg-transparent dark:border-[100px] border-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white dark:bg-transparent dark:border-[100px] border-white/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-display font-black text-white mb-6">
            Siap Bergabung dengan Desa Cerdas?
          </h2>
          <p className="text-subtitle text-emerald-50 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            Mulai kontribusi Anda untuk membangun desa yang lebih maju,
            transparan, dan sejahtera
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-100 dark:text-emerald-900 dark:hover:bg-emerald-200 font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all text-lg px-8 py-6 cursor-pointer"
              >
                Mulai Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/tentang">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-black dark:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-white font-bold rounded-xl shadow-xl text-lg px-8 py-6 cursor-pointer"
              >
                Pelajari Lebih Lanjut
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-300 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Home className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-black text-white">Desa Cerdas</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Platform digital untuk membangun desa yang lebih transparan,
                partisipatif, dan berkelanjutan melalui teknologi modern.
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Navigasi</h3>
              <ul className="space-y-2">
                {[
                  { href: "/kegiatan", label: "Kegiatan" },
                  { href: "/smartfarm", label: "Smart Farm" },
                  { href: "/tanya-hukum", label: "Tanya Hukum" },
                  { href: "/tentang", label: "Tentang Kami" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold mb-4">Bantuan</h3>
              <ul className="space-y-2">
                {[
                  { href: "/faq", label: "FAQ" },
                  { href: "/panduan", label: "Panduan" },
                  { href: "/kontak", label: "Kontak" },
                  { href: "/kebijakan", label: "Kebijakan Privasi" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2026 Desa Cerdas. Semua hak dilindungi undang-undang.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}