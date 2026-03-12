"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, UserCheck, HeartHandshake, ShieldCheck, HelpCircle } from "lucide-react";

export default function PanduanPage() {
  const steps = [
    {
      icon: UserCheck,
      title: "1. Mendaftar Akun",
      content:
        "Untuk mendapatkan akses penuh terhadap fitur-fitur yang ada di platform Desa Cerdas, termasuk fitur konsultasi hukum dan detail laporan proyek, Anda disarankan untuk membuat akun. Prosesnya cepat dan mudah, cukup masukkan email dan data yang diminta.",
    },
    {
      icon: HeartHandshake,
      title: "2. Melakukan Donasi",
      content:
        "Buka halaman Manajemen Donasi, lalu pilih kegiatan desa yang ingin didukung. Klik tombol 'Donasi', masukkan nominal yang diinginkan, dan Anda akan mendapatkan nomor rekening virtual atau bank transfer. Upload bukti transfer untuk keperluan verifikasi.",
    },
    {
      icon: ShieldCheck,
      title: "3. Memantau Transparansi",
      content:
        "Setiap donasi yang telah diverifikasi akan tercatat secara online di halaman publik kegiatan tersebut. Anda dapat memantau update laporan kemajuan dan detail pengeluaran pada bagian 'Laporan Pengeluaran', demi transparansi penggunaan dana.",
    },
    {
      icon: HelpCircle,
      title: "4. Tanya Hukum AI",
      content:
        "Untuk fitur Tanya Hukum, cukup buka halaman Tanya Hukum dari menu utama. Ketikkan pertanyaan seputar isu hukum maupun administrasi desa, lalu asisten virtual berteknologi AI kami akan memberikan panduan berdasarkan undang-undang.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Panduan Penggunaan
          </h1>
          <p className="text-emerald-50 max-w-2xl mx-auto text-lg">
            Pelajari cara memaksimalkan penggunaan platform Desa Cerdas dengan panduan langkah demi langkah di bawah ini.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index} className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                    <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                    {step.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
