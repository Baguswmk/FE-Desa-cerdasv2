"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Home, 
  AlertCircle, 
  User, 
  Mail, 
  CreditCard, 
  Phone,
  Lock,
  Shield,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { authService, RegisterData } from "@/services/auth.service";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<RegisterData>({
    nama: "",
    email: "",
    no_hp: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== confirmPassword) {
      const msg = "Password dan konfirmasi password tidak sama";
      setError(msg);
      toast.error(msg);
      return;
    }
    
    setLoading(true);
    try {
      const result = await authService.register(formData);
      if (result.success) {
        toast.success("Akun berhasil dibuat! Selamat datang 🎉");
        router.push("/warga/dashboard");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Registrasi gagal. Silakan coba lagi.";
      setError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (): { level: number; label: string; color: string } => {
    const p = formData.password;
    if (!p) return { level: 0, label: '', color: '' };
    
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    
    if (score <= 2) return { level: (score / 5) * 100, label: 'Lemah', color: 'bg-red-500' };
    if (score <= 3) return { level: (score / 5) * 100, label: 'Sedang', color: 'bg-amber-500' };
    return { level: (score / 5) * 100, label: 'Kuat', color: 'bg-green-500' };
  };

  const strength = passwordStrength();
  const isPasswordMatch = confirmPassword && formData.password === confirmPassword;
  const isPasswordMismatch = confirmPassword && formData.password !== confirmPassword;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-emerald-100 shadow-sm animate-fade-in-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                Desa Cerdas
              </span>
            </Link>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Sudah punya akun?</span>
              <Link href="/login">
                <Button variant="outline" size="sm" className="font-semibold border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-emerald-700 cursor-pointer">
                  Masuk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl shadow-lg mb-4 animate-bounce-in">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent mb-2">
            Buat Akun Baru
          </h1>
          <p className="text-gray-600 text-lg">
            Bergabunglah dengan Desa Cerdas untuk akses penuh
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 animate-fade-in animation-delay-200">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">
                <User className="w-3 h-3 mr-1" />
                Data Pribadi
              </Badge>
              <div className="w-12 h-1 bg-emerald-600 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white">
                <Lock className="w-3 h-3 mr-1" />
                Keamanan
              </Badge>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-emerald-100 shadow-2xl animate-scale-in animation-delay-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Informasi Pendaftaran
            </CardTitle>
            <CardDescription>
              Lengkapi data di bawah untuk membuat akun Anda
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 animate-bounce-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-100">
                  <User className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                    Informasi Pribadi
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nama Lengkap */}
                  <div className="space-y-2">
                    <Label htmlFor="nama" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      Nama Lengkap <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="nama"
                      type="text"
                      required
                      minLength={3}
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Nama lengkap Anda"
                      className="h-11 border-2 focus:border-emerald-500 focus:ring-emerald-500"
                      disabled={loading}
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-emerald-600" />
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="nama@email.com"
                      className="h-11 border-2 focus:border-emerald-500 focus:ring-emerald-500"
                      disabled={loading}
                    />
                  </div>

                  {/* No HP */}
                  <div className="space-y-2">
                    <Label htmlFor="no_hp" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      No. HP
                      <Badge variant="secondary" className="text-xs">Opsional</Badge>
                    </Label>
                    <Input
                      id="no_hp"
                      type="tel"
                      value={formData.no_hp}
                      onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                      placeholder="081234567890"
                      className="h-11 border-2 focus:border-emerald-500 focus:ring-emerald-500"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b-2 border-emerald-100">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-emerald-700 uppercase tracking-wide">
                    Keamanan Akun
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min. 8 karakter"
                        className="h-11 border-2 focus:border-emerald-500 focus:ring-emerald-500 pr-12"
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-0.5 h-10 w-10 hover:bg-emerald-50 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    
                    {formData.password && (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Kekuatan password:</span>
                          <span className={`font-semibold ${
                            strength.label === 'Kuat' ? 'text-green-600' :
                            strength.label === 'Sedang' ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {strength.label}
                          </span>
                        </div>
                        <Progress value={strength.level} className={`h-2 ${strength.color}`} />
                        <p className="text-xs text-gray-500">
                          Gunakan huruf besar, kecil, angka, dan simbol
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Konfirmasi Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className={`h-11 border-2 pr-12 ${
                          isPasswordMatch ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                          isPasswordMismatch ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                          'focus:border-emerald-500 focus:ring-emerald-500'
                        }`}
                        disabled={loading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-0.5 h-10 w-10 hover:bg-emerald-50 cursor-pointer"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    
                    {isPasswordMismatch && (
                      <p className="text-xs text-red-600 flex items-center gap-1 animate-fade-in">
                        <XCircle className="w-3 h-3" />
                        Password tidak cocok
                      </p>
                    )}
                    {isPasswordMatch && (
                      <p className="text-xs text-green-600 flex items-center gap-1 animate-fade-in">
                        <CheckCircle2 className="w-3 h-3" />
                        Password cocok
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Note */}
              <Alert className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <Shield className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-sm text-emerald-900">
                  <strong>Privasi Anda dilindungi.</strong> Data Anda digunakan hanya untuk keperluan layanan 
                  Desa Cerdas dan tidak akan dibagikan kepada pihak ketiga.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mendaftarkan akun...
                  </>
                ) : (
                  <>
                    Buat Akun Sekarang
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center">
            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors">
                Masuk di sini
              </Link>
            </p>
          </CardFooter>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500 animate-fade-in animation-delay-500">
          <p>
            Dengan mendaftar, Anda menyetujui{' '}
            <Link href="/terms" className="text-emerald-600 hover:underline">
              Syarat & Ketentuan
            </Link>
            {' '}dan{' '}
            <Link href="/privacy" className="text-emerald-600 hover:underline">
              Kebijakan Privasi
            </Link>
            {' '}kami
          </p>
        </div>
      </div>
    </div>
  );
}