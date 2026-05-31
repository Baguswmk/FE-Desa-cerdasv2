"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Leaf, Bug, Zap } from "lucide-react";
import { CROPS, CROP_TIPS, CropKey } from "./constants";

export default function CropTips() {
  const [selectedCrop, setSelectedCrop] = useState<CropKey>("padi");
  
  return (
    <div className="space-y-8">
      {/* Crop Selection */}
      <div className="animate-fade-in-up animation-delay-400">
        <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-6">Pilih Jenis Tanaman</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {CROPS.map((crop) => (
            <Button
              key={crop.id}
              variant={selectedCrop === crop.id ? "default" : "outline"}
              onClick={() => setSelectedCrop(crop.id as CropKey)}
              className={`h-24 flex-col gap-2 cursor-pointer transition-all ${
                selectedCrop === crop.id
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold border-0 shadow-lg"
                  : "border-2 border-emerald-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-800 text-emerald-700 dark:text-emerald-400 font-semibold bg-white dark:bg-gray-800"
              }`}
            >
              <span className="text-4xl">{crop.icon}</span>
              <span>{crop.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Crop Tips */}
      <Card className="border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-xl animate-fade-in-up animation-delay-500 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700">
          <CardTitle className="text-2xl font-black text-gray-900 dark:text-gray-100">
            Panduan Budidaya {CROPS.find((c) => c.id === selectedCrop)?.name}
          </CardTitle>
          <CardDescription className="dark:text-gray-400">Tips dan trik untuk hasil panen maksimal</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Penyiraman */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Penyiraman</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{CROP_TIPS[selectedCrop].watering}</p>
                </div>
              </div>
            </div>
            {/* Pemupukan */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Pemupukan</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{CROP_TIPS[selectedCrop].fertilizer}</p>
                </div>
              </div>
            </div>
            {/* Pengendalian Hama */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Bug className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Pengendalian Hama</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{CROP_TIPS[selectedCrop].pestControl}</p>
                </div>
              </div>
            </div>
            {/* Waktu Panen */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">Waktu Panen</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{CROP_TIPS[selectedCrop].harvest}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
