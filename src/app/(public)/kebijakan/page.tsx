"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function KebijakanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Kebijakan Privasi
          </h1>
          <p className="text-emerald-50 max-w-2xl mx-auto text-lg">
            Terakhir diperbarui: 12 Maret 2026. Prioritas kami adalah melindungi data dan privasi Anda.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardContent className="p-8 md:p-12 prose dark:prose-invert max-w-none prose-emerald bg-white dark:bg-gray-800">
            <h3>1. Pengumpulan Informasi</h3>
            <p>
              Kami mengumpulkan informasi dari Anda secara langsung saat Anda mendaftarkan akun di platform Desa Cerdas, termasuk namun tidak terbatas pada nama lengkap, alamat email, dan nomor sandi. Kami juga mengumpulkan informasi teknis seperti alamat IP dan jenis peramban web untuk kepentingan akses riwayat di fitur AI Konsultasi serta perlindungan server keamanan.
            </p>

            <h3>2. Penggunaan Informasi Pribadi</h3>
            <p>
              Setiap informasi yang dikumpulkan digunakan semata-mata untuk memfasilitasi kebutuhan penggunaan platform, contohnya:
            </p>
            <ul>
              <li>Mendaftarkan donasi sesuai nama donor yang dikehendaki.</li>
              <li>Menyimpan preferensi user dan riwayat percakapan konsultasi hukum AI.</li>
              <li>Memberikan notifikasi pengumuman dari Admin atau Pemerintah Desa.</li>
            </ul>

            <h3>3. Kerahasiaan Data & Sistem Pembayaran</h3>
            <p>
              Data pribadi yang dibagikan kepada sistem Desa Cerdas dan setiap bukti transfer yang diunggah disimpan dengan aman pada basis data terenkripsi. Kami <strong>tidak pernah menjual</strong>, mendistribusikan, maupun membagikan informasi rahasia tersebut ke pihak ketiga di luar keperluan teknis internal maupun yurisdiksi kewajiban hukum.
            </p>

            <h3>4. Hak Pengguna Atas Data Pribadi</h3>
            <p>
              Anda memiliki hak setiap saat untuk merevisi data profil Anda di platform maupun mengajukan penghapusan akun serta seluruh data terkait dengan menghubungi kami di kanal resmi platform (email / telepon / whatsapp).
            </p>

            <h3>5. Cookie & Analytics</h3>
            <p>
              Sistem Desa Cerdas menggunakan "cookies" esensial untuk mengidentifikasi keberadaan sesi (session) log masuk agar Anda tidak perlu berulang kali mendaftar masukan kunci sandi pada peramban web.
            </p>

            <h3>6. Perubahan Syarat dan Kebijakan</h3>
            <p>
              Kami dapat merevisi detail dokumen kebijakan privasi ini secara berkala dan setiap perubahan akan dinotifikasikan melalui kanal antarmuka atau notifikasi.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
