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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Sprout,
  LogOut,
  Loader2,
  PlusCircle,
  MapPin,
  Layers,
  Maximize2,
  Sparkles,
  Calendar,
  X,
  Leaf,
} from "lucide-react";
import { smartFarmService } from "@/services/smartfarm.service";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import type { SmartFarm } from "@/types";

export default function SmartFarmPage() {
  const { user, logout } = useAuth();
  const [farms, setFarms] = useState<SmartFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    crop_type: "",
    area_size: "",
    location: "",
    soil_type: "",
    current_condition: "",
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
      await smartFarmService.createFarm({
        ...formData,
        area_size: Number(formData.area_size),
      });

      setShowForm(false);
      setFormData({
        crop_type: "",
        area_size: "",
        location: "",
        soil_type: "",
        current_condition: "",
      });
      loadFarms();
    } catch (error: any) {
      alert(error.response?.data?.message || "Gagal menambahkan tanaman");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) {
    return <LoadingScreen message="Memuat data tanaman..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b-2 border-emerald-100 animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3 animate-slide-in-left">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Smart Farm AI
                </span>
                <p className="text-xs text-gray-500 font-medium">
                  Pertanian Cerdas
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 animate-slide-in-right">
              <Link href="/warga/dashboard">
                <Button
                  variant="ghost"
                  className="font-semibold text-gray-700 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Button
                onClick={() => logout()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Banner */}
        <Card className="border-2 shadow-2xl mb-8 overflow-hidden animate-fade-in-up animation-delay-200">
          <CardHeader className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-black mb-2 text-white">
                    🌱 Smart Farm AI
                  </CardTitle>
                  <CardDescription className="text-emerald-100 text-base font-medium">
                    Kelola tanaman Anda dengan bantuan kecerdasan buatan
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all h-12"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Tambah Tanaman
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Add Form */}
        {showForm && (
          <Card className="border-2 shadow-2xl mb-8 animate-scale-in animation-delay-300">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b-2 border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-gray-900">
                    Tambah Data Tanaman Baru
                  </CardTitle>
                  <CardDescription className="text-base mt-1">
                    Isi informasi tanaman untuk mendapatkan rekomendasi AI
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowForm(false)}
                  className="hover:bg-red-50 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="crop_type"
                      className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2"
                    >
                      <Leaf className="w-4 h-4 text-emerald-600" />
                      Jenis Tanaman *
                    </Label>
                    <Input
                      id="crop_type"
                      type="text"
                      required
                      value={formData.crop_type}
                      onChange={(e) =>
                        setFormData({ ...formData, crop_type: e.target.value })
                      }
                      placeholder="Contoh: Padi, Jagung, Cabai"
                      className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="area_size"
                      className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2"
                    >
                      <Maximize2 className="w-4 h-4 text-emerald-600" />
                      Luas Area (m²) *
                    </Label>
                    <Input
                      id="area_size"
                      type="number"
                      required
                      min="1"
                      value={formData.area_size}
                      onChange={(e) =>
                        setFormData({ ...formData, area_size: e.target.value })
                      }
                      placeholder="1000"
                      className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="location"
                      className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      Lokasi *
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Nama dusun/kampung"
                      className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="soil_type"
                      className="text-sm font-black text-gray-700 uppercase tracking-wider flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4 text-emerald-600" />
                      Jenis Tanah *
                    </Label>
                    <Select
                      required
                      value={formData.soil_type}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, soil_type: value })
                      }
                    >
                      <SelectTrigger className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500">
                        <SelectValue placeholder="Pilih jenis tanah" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="liat">Liat</SelectItem>
                        <SelectItem value="berpasir">Berpasir</SelectItem>
                        <SelectItem value="berhumus">Berhumus</SelectItem>
                        <SelectItem value="lempung">Lempung</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="current_condition"
                    className="text-sm font-black text-gray-700 uppercase tracking-wider"
                  >
                    Kondisi Saat Ini *
                  </Label>
                  <Textarea
                    id="current_condition"
                    required
                    rows={4}
                    value={formData.current_condition}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_condition: e.target.value,
                      })
                    }
                    placeholder="Deskripsikan kondisi tanaman (umur, kesehatan, masalah yang dihadapi, dll)"
                    className="border-2 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Menambahkan...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Tambahkan Tanaman
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="h-14 px-8 border-2 font-bold hover:bg-gray-50"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Farms List */}
        {loading ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <p className="text-lg font-semibold text-gray-700">
              Memuat data tanaman...
            </p>
          </div>
        ) : farms.length === 0 ? (
          <Card className="border-2 shadow-2xl animate-scale-in animation-delay-300">
            <CardContent className="text-center py-16">
              <div className="inline-block p-5 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl mb-6 animate-bounce-in">
                <Sprout className="w-16 h-16 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                Belum Ada Data Tanaman
              </h3>
              <p className="text-gray-600 font-medium max-w-md mx-auto mb-6">
                Mulai tambahkan data tanaman Anda untuk mendapatkan rekomendasi
                AI
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Tambah Tanaman Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {farms.map((farm, index) => (
              <Card
                key={farm.id}
                className={`border-2 shadow-2xl overflow-hidden hover:shadow-emerald-200 transition-all duration-300 animate-fade-in-up animation-delay-${(index + 3) * 100}`}
              >
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-black mb-2">
                        {farm.crop_type}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-emerald-100 font-medium">
                        <MapPin className="w-4 h-4" />
                        {farm.location}
                      </CardDescription>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-emerald-50/50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Maximize2 className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-600">
                          Luas Area
                        </span>
                      </div>
                      <span className="font-black text-gray-900">
                        {farm.area_size} m²
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-emerald-50/50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-600">
                          Jenis Tanah
                        </span>
                      </div>
                      <span className="font-black text-gray-900 capitalize">
                        {farm.soil_type}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                      Kondisi:
                    </p>
                    <p className="text-sm text-gray-900 line-clamp-2 font-medium">
                      {farm.current_condition}
                    </p>
                  </div>

                  {farm.ai_recommendation && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                          Rekomendasi AI
                        </p>
                      </div>
                      <p className="text-sm text-emerald-900 line-clamp-3 font-medium">
                        {farm.ai_recommendation}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pt-2 border-t border-gray-200">
                    <Calendar className="w-3 h-3" />
                    Dibuat:{" "}
                    {new Date(farm.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
