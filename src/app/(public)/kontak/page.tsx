"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function KontakPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 dark:from-emerald-900 dark:via-teal-900 dark:to-green-900 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6">
            <Send className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Hubungi Kami
          </h1>
          <p className="text-emerald-50 max-w-2xl mx-auto text-lg">
            Kami siap mendengar masukan, pertanyaan, maupun laporan dari Anda. Hubungi kami melalui informasi di bawah ini.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-xl hover:-translate-y-1 transition text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-2">Email</h3>
              <p className="text-gray-600 dark:text-gray-400">info@desacerdas.id</p>
              <p className="text-gray-600 dark:text-gray-400">support@desacerdas.id</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-xl hover:-translate-y-1 transition text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-2">Telepon</h3>
              <p className="text-gray-600 dark:text-gray-400">+62 21 1234 5678</p>
              <p className="text-gray-600 dark:text-gray-400">+62 812 3456 7890 (WA)</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-xl hover:-translate-y-1 transition text-center">
            <CardContent className="pt-8 pb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-md">
                <MapPin className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-xl mb-2">Alamat</h3>
              <p className="text-gray-600 dark:text-gray-400">Jl. Desa Pintar No. 1</p>
              <p className="text-gray-600 dark:text-gray-400">Jakarta Pusat, Indonesia 10110</p>
            </CardContent>
          </Card>
        </div>

        {/* Formulir Kontak Sederhana (dummy form UI) */}
        <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700">
            <CardTitle className="text-2xl font-bold text-center">Kirim Pesan Langsung</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Lengkap</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-900 dark:text-white" placeholder="Masukkan nama Anda" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Alamat Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-900 dark:text-white" placeholder="nama@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Subjek Pesan</label>
                <input type="text" className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-900 dark:text-white" placeholder="Masalah login, Donasi, dll." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pesan Anda</label>
                <textarea rows={5} className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-900 dark:text-white" placeholder="Tuliskan pesan atau pertanyaan Anda di sini..."></textarea>
              </div>
              <button type="submit" className="w-full md:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-lg hover:-translate-y-1 transition text-lg">
                Kirim Pesan
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
