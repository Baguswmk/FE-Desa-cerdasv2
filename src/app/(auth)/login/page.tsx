"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Home, AlertCircle, Sparkles, Heart, Scale, Sprout } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(formData);
      const response = result as { success: boolean; data: { user: { role: "ADMIN" | "WARGA" } } };
      if (response.success) {
        const nextPath = searchParams.get("next");
        if (nextPath) {
          router.push(nextPath);
        } else if (response.data.user.role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/warga/dashboard");
        }
      }
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Login gagal. Silakan coba lagi.";
      setError(message || "Login gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Home, text: "Kelola kegiatan desa dengan mudah" },
    { icon: Heart, text: "Donasi transparan & terverifikasi" },
    { icon: Scale, text: "Konsultasi hukum berbasis AI" },
    { icon: Sprout, text: "Smart Farm untuk petani desa" }
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-12 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>

        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        <div className="relative z-10 animate-fade-in-down">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-emerald-700"></div>
            </div>
            <span className="text-2xl font-black text-white">Desa Cerdas</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8 animate-fade-in-up animation-delay-200">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-white leading-tight">
              Wujudkan desa<br />
              yang <span className="italic text-amber-300">lebih baik</span><br />
              bersama-sama
            </h1>
            <p className="text-emerald-100 text-lg leading-relaxed max-w-lg">
              Platform digital terintegrasi untuk transparansi kegiatan desa, donasi online,
              konsultasi hukum AI, dan smart farming.
            </p>
          </div>

          <div className="space-y-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-3 text-white/90 animate-slide-in-left animation-delay-${(index + 3) * 100}`}
                >
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-emerald-50/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-pulse-slow"></div>

        <Card className="w-full max-w-md relative z-10 border-2 shadow-2xl animate-scale-in">
          <CardHeader className="space-y-3">
            <div className="lg:hidden flex justify-center mb-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white"></div>
                </div>
                <span className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                  Desa Cerdas
                </span>
              </Link>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 transition-colors group w-fit"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Beranda
            </Link>

            <div>
              <CardTitle className="text-3xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Selamat Datang
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Masuk ke akun Anda untuk melanjutkan
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-bounce-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nama@email.com"
                  className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Kata Sandi
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Masukkan kata sandi"
                    className="h-12 border-2 focus:border-emerald-500 focus:ring-emerald-500 pr-12"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1 h-10 w-10 hover:bg-emerald-50 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk ke Akun"
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col space-y-4">
            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link href="/register" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors">
                Daftar Sekarang
              </Link>
            </p>

            <Alert className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-sm text-amber-900">
                <strong>Demo Mode:</strong> Backend berjalan dalam demo mode.
                API eksternal menggunakan data mock jika tidak dikonfigurasi.
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
