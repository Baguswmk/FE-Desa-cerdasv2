"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import AdminNavbar from "@/components/AdminNavbar";
import { CopyPlus, CheckCircle, Gift, Settings, Users } from "lucide-react";
import TabPeriode from "./_components/TabPeriode";
import TabVerifikasi from "./_components/TabVerifikasi";
import TabDistribusi from "./_components/TabDistribusi";
import TabConfig from "./_components/TabConfig";
import TabWarga from "./_components/TabWarga";

export default function AdminZakatPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"periode" | "verifikasi" | "distribusi" | "config" | "warga">("warga");

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (!storedUser || storedUser.role !== "ADMIN") {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20">
      <AdminNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Manajemen Zakat</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola periode, verifikasi pembayaran, distribusi, dan konfigurasi zakat.</p>
        </div>

        <div className="flex p-1.5 gap-2 bg-white dark:bg-gray-800 shadow-md rounded-2xl mb-8 overflow-x-auto custom-scrollbar border border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("warga")}
            className={`flex-1 cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === "warga"
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="hidden sm:inline">Kelola Warga / Excel</span>
          </button>
          <button
            onClick={() => setActiveTab("verifikasi")}
            className={`flex-1 cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === "verifikasi"
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="hidden sm:inline">Verifikasi Bayar</span>
          </button>
          <button
            onClick={() => setActiveTab("periode")}
            className={`flex-1 cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === "periode"
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <CopyPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Periode</span>
          </button>
          <button
            onClick={() => setActiveTab("distribusi")}
            className={`flex-1 cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === "distribusi"
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <Gift className="w-5 h-5" />
            <span className="hidden sm:inline">Distribusi</span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`flex-1 cursor-pointer min-w-[150px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
              activeTab === "config"
                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Pengaturan</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
          {activeTab === "warga" && <TabWarga />}
          {activeTab === "verifikasi" && <TabVerifikasi />}
          {activeTab === "periode" && <TabPeriode />}
          {activeTab === "distribusi" && <TabDistribusi />}
          {activeTab === "config" && <TabConfig />}
        </div>
      </div>
    </div>
  );
}
