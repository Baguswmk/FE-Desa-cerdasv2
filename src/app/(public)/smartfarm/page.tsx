"use client";

import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Sprout, Sparkles } from "lucide-react";

import WeatherWidget from "./_components/WeatherWidget";
import CropTips from "./_components/CropTips";
import FarmChatBox from "./_components/FarmChatBox";

export default function SmartFarmPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/20 dark:bg-emerald-900/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      <Navbar currentPage="smartfarm" />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 py-16 animate-fade-in z-10">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-2xl mb-6 shadow-lg shadow-black/10 animate-float">
            <Sprout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 animate-fade-in-up animation-delay-200 drop-shadow-md">
            Smart Farm AI
          </h1>
          <p className="text-lg md:text-xl text-emerald-50 mb-6 max-w-2xl mx-auto animate-fade-in-up animation-delay-300 font-medium">
            Platform pertanian cerdas berbasis AI untuk membantu petani desa meningkatkan kuantitas dan kualitas hasil panen.
          </p>
          <Badge className="bg-white/20 text-white backdrop-blur-md border border-white/30 px-6 py-2.5 text-sm font-bold shadow-sm animate-fade-in-up animation-delay-400">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Artificial Intelligence
          </Badge>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-20">
        {/* Weather Widget */}
        <div className="-mt-8 mb-12">
          <WeatherWidget />
        </div>

        {/* Crops Info */}
        <div className="mb-12">
          <CropTips />
        </div>

        {/* Farm Chat */}
        <div className="mb-12">
          <FarmChatBox />
        </div>
      </div>
    </div>
  );
}
