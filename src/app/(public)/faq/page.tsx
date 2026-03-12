"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, MessageCircle, Info } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      question: "Apa itu Desa Cerdas?",
      answer:
        "Desa Cerdas adalah platform digital terintegrasi yang menghubungkan pemerintah desa dengan warga untuk menciptakan transparansi, partisipasi, dan pembangunan berkelanjutan.",
    },
    {
      question: "Bagaimana cara berdonasi untuk sebuah kegiatan?",
      answer:
        "Anda dapat menuju ke halaman 'Donasi' atau 'Kegiatan', pilih kegiatan yang ingin didukung, kemudian klik 'Donasi'. Anda akan diarahkan ke halaman detail untuk mengisi form donasi dan melakukan pembayaran sesuai instruksi.",
    },
    {
      question: "Apakah donasi saya transparan dan aman?",
      answer:
        "Tentu. Setiap donasi yang masuk akan diverifikasi oleh sistem dan admin, serta dapat dipantau perkembangannya secara real-time di halaman kegiatan tersebut. Bukti pengeluaran juga akan dilaporkan oleh admin.",
    },
    {
      question: "Siapa yang dapat menggunakan fitur Tanya Hukum AI?",
      answer:
        "Seluruh warga yang telah mendaftar dan memiliki akun di platform Desa Cerdas dapat mengakses fitur konsultasi hukum berbasis AI secara gratis.",
    },
    {
      question: "Bagaimana cara mendaftar sebagai warga?",
      answer:
        "Klik tombol 'Masuk' di pojok kanan atas, kemudian pilih opsi pendaftaran akun baru. Isi data diri Anda dengan benar dan ikuti langkah verifikasi selanjutnya.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-emerald-50 max-w-2xl mx-auto text-lg">
            Temukan jawaban atas pertanyaan yang paling sering diajukan seputar platform Desa Cerdas.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b-2 border-emerald-100 dark:border-gray-700 pb-4">
                <CardTitle className="flex items-start gap-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                  <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{faq.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {faq.answer}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center p-8 bg-emerald-100/50 dark:bg-gray-800 rounded-2xl border-2 border-emerald-200 dark:border-gray-700">
          <Info className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Masih punya pertanyaan?</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Hubungi tim dukungan kami, dan kami akan dengan senang hati membantu.</p>
          <a href="/kontak" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1">
            Hubungi Kami
          </a>
        </div>
      </div>
    </div>
  );
}
