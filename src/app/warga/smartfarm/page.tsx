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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Home,
  Sprout,
  LogOut,
  Loader2,
  PlusCircle,
  MapPin,
  Sparkles,
  Calendar,
  X,
  Leaf,
  Thermometer,
  CloudRain,
  Wind,
  Trash2,
  Bot,
} from "lucide-react";
import { smartFarmService } from "@/services/smartfarm.service";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import WeatherWidget from "@/app/(public)/smartfarm/_components/WeatherWidget";
import { toast } from "sonner";

export default function SmartFarmPage() {
  const { user, logout } = useAuth();
  const [farms, setFarms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Real forms mapping to correct Backend Schema
  const [formData, setFormData] = useState({
    plant_name: "",
    plant_date: new Date().toISOString().split("T")[0],
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      loadFarms();
    }
  }, [user]);

  const loadFarms = async () => {
    try {
      const response = await smartFarmService.getUserFarms();
      setFarms(response.data || []);
    } catch (error) {
      console.error("Error loading farms:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await smartFarmService.createFarmRecord({
        plant_name: formData.plant_name,
        plant_date: new Date(formData.plant_date).toISOString(),
        location: formData.location,
      });

      setShowForm(false);
      setFormData({
        plant_name: "",
        plant_date: new Date().toISOString().split("T")[0],
        location: "",
      });
      loadFarms();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Gagal menambahkan data tanaman",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus data tanaman ini?")) return;
    try {
      await smartFarmService.deleteFarmRecord(id);
      loadFarms();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Gagal menghapus tanaman");
    }
  };

  if (loading || !user) {
    return <LoadingScreen message="Memuat data pertanian..." />;
  }

  // Calculate percentage of harvest
  const calculateHarvestProgress = (
    plantDateStr: string,
    estimateStr: string,
  ) => {
    const start = new Date(plantDateStr).getTime();
    const end = new Date(estimateStr).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-emerald-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <Sprout className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Smart Farm Warga
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/warga/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-semibold text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800"
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => logout()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Weather Mini-App for Dashboard */}
        <div className="animate-fade-in-up animation-delay-100">
          <WeatherWidget className="!shadow-md" />
        </div>

        {/* Header Action */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up animation-delay-200">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Tanaman Saya
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Pantau perkembangan tanaman dan prediksi masa panen.
            </p>
          </div>

          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Tambah Tanaman
            </Button>
          )}
        </div>

        {/* Add Form (Expandable) */}
        {showForm && (
          <Card className="border-2 border-emerald-100 dark:border-gray-800 shadow-xl animate-scale-in dark:bg-gray-800">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
                    Rekam Data Tanaman
                  </CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    AI akan otomatis mendeteksi cuaca dan memberikan panduan
                    penanaman.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForm(false)}
                  className="hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-900/30"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="plant_name"
                      className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"
                    >
                      <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Nama Tanaman
                    </Label>
                    <Input
                      id="plant_name"
                      type="text"
                      required
                      value={formData.plant_name}
                      onChange={(e) =>
                        setFormData({ ...formData, plant_name: e.target.value })
                      }
                      placeholder="Misal: Padi Ciherang"
                      className="border-2 dark:border-gray-700 dark:bg-gray-900 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="plant_date"
                      className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Tanggal Tanam
                    </Label>
                    <Input
                      id="plant_date"
                      type="date"
                      required
                      value={formData.plant_date}
                      onChange={(e) =>
                        setFormData({ ...formData, plant_date: e.target.value })
                      }
                      className="border-2 dark:border-gray-700 dark:bg-gray-900 focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Lokasi / Desa
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Nama dusun/desa"
                      className="border-2 dark:border-gray-700 dark:bg-gray-900 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="sm:w-auto px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sedang
                        Menganalisis...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" /> Analisis dengan AI
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="sm:w-auto px-8 border-2 font-bold dark:border-gray-700 dark:text-gray-300"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Farms List */}
        {!loading && farms.length === 0 ? (
          <Card className="border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-none bg-transparent">
            <CardContent className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Sprout className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Belum ada tanaman
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 mw-md mx-auto">
                Kami akan menganalisis cuaca otomatis saat Anda merekam data.
              </p>
              {!showForm && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Tambah Rekaman Pertama
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
            {farms.map((farm, index) => {
              const progress = farm.harvest_estimate
                ? calculateHarvestProgress(
                    farm.plant_date,
                    farm.harvest_estimate,
                  )
                : 0;
              return (
                <Card
                  key={farm.id}
                  className={`border-2 border-gray-100 dark:border-gray-800 shadow-lg hover:shadow-xl dark:bg-gray-800 transition-all duration-300 animate-fade-in-up animation-delay-${Math.min(index, 5) * 100} group`}
                >
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-white dark:from-gray-800 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl font-black text-gray-900 dark:text-gray-100">
                            {farm.plant_name}
                          </CardTitle>
                          {progress >= 100 && (
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                              Siap Panen!
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium text-xs">
                          <MapPin className="w-3.5 h-3.5" />
                          {farm.location}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(farm.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-2 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {/* Harvest Progress */}
                    {farm.harvest_estimate && (
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-emerald-50/30 dark:bg-gray-800/50">
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                            Estimasi Panen
                          </span>
                          <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 font-medium mt-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Tanam:{" "}
                            {new Date(farm.plant_date).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-500 font-bold">
                            <Sparkles className="w-3 h-3" /> Panen:{" "}
                            {new Date(farm.harvest_estimate).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-5 flex flex-col gap-4">
                      {/* Weather Data Snapshot at planting */}
                      {farm.weather_data &&
                        Object.keys(farm.weather_data).length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            <Badge
                              variant="outline"
                              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 gap-1 font-semibold py-1"
                            >
                              <Thermometer className="w-3 h-3 text-red-500" />{" "}
                              {farm.weather_data.temperature}°C
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 gap-1 font-semibold py-1"
                            >
                              <CloudRain className="w-3 h-3 text-blue-500" />{" "}
                              {farm.weather_data.humidity}%
                            </Badge>
                            <Badge
                              variant="outline"
                              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 gap-1 font-semibold py-1"
                            >
                              <Wind className="w-3 h-3 text-gray-500" />{" "}
                              {farm.weather_data.wind_speed} m/s
                            </Badge>
                          </div>
                        )}

                      {/* AI Analysis */}
                      {farm.ai_analysis && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-500 p-4 rounded-r-xl">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-xs font-black text-blue-800 dark:text-blue-400 uppercase tracking-wider">
                              Saran Tindakan AI
                            </p>
                          </div>
                          <div
                            className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-line leading-relaxed font-medium"
                            dangerouslySetInnerHTML={{
                              __html: farm.ai_analysis.replace(
                                /\*\*(.*?)\*\*/g,
                                "<strong>$1</strong>",
                              ),
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
