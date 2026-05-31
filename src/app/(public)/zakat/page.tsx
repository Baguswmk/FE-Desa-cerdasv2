"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Calculator, CreditCard, HeartHandshake, FileText } from "lucide-react";
import ZakatCalculator from "./_components/ZakatCalculator";
import ZakatPaymentForm from "./_components/ZakatPaymentForm";
import ZakatTransparency from "./_components/ZakatTransparency";

type ZakatCalcType = "FITRAH" | "MAAL" | "PENGHASILAN";

export default function ZakatPage() {
  const [activeTab, setActiveTab] = useState<"calc" | "pay" | "transparency">("calc");
  const [prefilledAmount, setPrefilledAmount] = useState<number>();
  const [prefilledType, setPrefilledType] = useState<ZakatCalcType>();

  const handlePayNow = (amount: number, type: ZakatCalcType) => {
    setPrefilledAmount(amount);
    setPrefilledType(type);
    setActiveTab("pay");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950 dark:via-teal-950 dark:to-green-950 transition-colors duration-300">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-800/20 rounded-full blur-3xl animate-pulse [animation-delay:1000ms]"></div>
      </div>

      <Navbar currentPage="zakat" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200 mb-6 border-emerald-200 dark:border-emerald-700 px-4 py-1.5 shadow-sm">
            Layanan Zakat Desa Cerdas
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
            Tunaikan Zakat Anda <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              Mudah & Transparan
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Hitung kewajiban zakat Anda, lakukan pembayaran secara digital, dan pantau penyalurannya secara transparan.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-24 z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Tabs */}
          <div className="flex p-1.5 bg-white dark:bg-gray-800 gap-2   shadow-md rounded-2xl mb-8 overflow-x-auto custom-scrollbar border border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setActiveTab("calc")}
              className={`flex-1  cursor-pointer min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                activeTab === "calc"
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <Calculator className="w-5 h-5" />
              <span className="hidden sm:inline">Kalkulator Zakat</span>
            </button>
            <button
              onClick={() => setActiveTab("pay")}
              className={`flex-1  cursor-pointer min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                activeTab === "pay"
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span className="hidden sm:inline">Bayar Zakat</span>
            </button>
            <button
              onClick={() => setActiveTab("transparency")}
              className={`flex-1  cursor-pointer min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                activeTab === "transparency"
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <HeartHandshake className="w-5 h-5" />
              <span className="hidden sm:inline">Transparansi</span>
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl border border-emerald-100 dark:border-gray-700 transition-all duration-300">
            {activeTab === "calc" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex justify-center items-center gap-2">
                    <Calculator className="w-6 h-6 text-emerald-500" />
                    Kalkulator Zakat
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Hitung kewajiban zakat Fitrah, Maal, atau Penghasilan Anda
                  </p>
                </div>
                <ZakatCalculator onPayNow={handlePayNow} />
              </div>
            )}

            {activeTab === "pay" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex justify-center items-center gap-2">
                    <CreditCard className="w-6 h-6 text-emerald-500" />
                    Bayar Zakat
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Salurkan zakat Anda untuk masyarakat desa yang membutuhkan
                  </p>
                </div>
                <ZakatPaymentForm defaultAmount={prefilledAmount} defaultType={prefilledType} />
              </div>
            )}

            {activeTab === "transparency" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex justify-center items-center gap-2">
                    <FileText className="w-6 h-6 text-emerald-500" />
                    Transparansi Penyaluran
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Pantau data penerimaan dan penyaluran zakat per periode
                  </p>
                </div>
                <ZakatTransparency />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
