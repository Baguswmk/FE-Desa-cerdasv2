"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudRain, Wind, Droplets, MapPin, ExternalLink, RefreshCw, ChevronUp, ChevronDown, Calendar, AlertTriangle, Loader2 } from "lucide-react";
import { KECAMATAN_LIST, WILAYAH_DATA, WilayahEntry } from "./constants";

interface BmkgForecast {
  datetime: string;
  local_datetime: string;
  t: number; 
  hu: number; 
  ws: number; 
  wd: string; 
  tp: number; 
  weather_desc: string;
  image: string; 
  vs_text: string; 
}

interface BmkgResponse {
  lokasi: { desa: string; kecamatan: string; provinsi: string };
  data: Array<{ cuaca: BmkgForecast[][] }>;
}

export default function WeatherWidget({ className = "" }: { className?: string }) {
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>("Pringsewu");
  const [selectedDesa, setSelectedDesa] = useState<string>("18.10.01.1004");
  const [bmkgData, setBmkgData] = useState<BmkgResponse | null>(null);
  const [bmkgLoading, setBmkgLoading] = useState(false);
  const [bmkgError, setBmkgError] = useState<string | null>(null);
  const [isBmkgExpanded, setIsBmkgExpanded] = useState(false);

  const desaList = WILAYAH_DATA.filter((w) => w.kecamatan === selectedKecamatan);

  const handleKecamatanChange = (kec: string) => {
    setSelectedKecamatan(kec);
    const firstDesa = WILAYAH_DATA.find((w) => w.kecamatan === kec);
    if (firstDesa) setSelectedDesa(firstDesa.kode);
    setBmkgData(null);
  };

  useEffect(() => {
    if (!selectedDesa) return;
    fetchBmkg();
  }, [selectedDesa]);

  const fetchBmkg = async () => {
    setBmkgLoading(true);
    setBmkgError(null);
    try {
      const res = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${selectedDesa}`);
      if (!res.ok) throw new Error("Gagal memuat data BMKG");
      const json: BmkgResponse = await res.json();
      setBmkgData(json);
    } catch (e: unknown) {
      setBmkgError(e instanceof Error ? e.message : "Gagal memuat data cuaca");
    } finally {
      setBmkgLoading(false);
    }
  };

  const todayForecasts: BmkgForecast[] = bmkgData?.data?.[0]?.cuaca?.[0] ?? [];
  const currentForecast: BmkgForecast | undefined = todayForecasts[0];
  const next3Days = bmkgData?.data?.[0]?.cuaca?.slice(0, 3) ?? [];

  const selectedDesaEntry: WilayahEntry | undefined = WILAYAH_DATA.find((w) => w.kode === selectedDesa);

  const formatJam = (ldt: string) => {
    const d = new Date(ldt.replace(" ", "T"));
    return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  const formatTanggal = (ldt: string) => {
    const d = new Date(ldt.replace(" ", "T"));
    return d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
  };

  return (
    <Card className={`border-2 border-emerald-100 dark:border-gray-800 dark:bg-gray-800 shadow-2xl overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 border-b border-emerald-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl font-black text-gray-900 dark:text-gray-100">
              <CloudRain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Prakiraan Cuaca BMKG
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1 dark:text-gray-400">
              <span>Data dari</span>
              <a
                href="https://www.bmkg.go.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                BMKG
                <ExternalLink className="w-3 h-3" />
              </a>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {bmkgData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setIsBmkgExpanded(true); fetchBmkg(); }}
                disabled={bmkgLoading}
                className="border-2 border-emerald-200 dark:border-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 font-semibold h-9"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${bmkgLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Perbarui</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBmkgExpanded(!isBmkgExpanded)}
              className="border-2 border-emerald-200 dark:border-gray-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 h-9 w-9 p-0"
            >
              {isBmkgExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Kecamatan + Desa Selector (Only show if expanded or no data) */}
        <div className={`flex flex-col sm:flex-row gap-3 mt-4 transition-all duration-300`}>
          <div className="flex-1">
            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Kecamatan
            </label>
            <Select value={selectedKecamatan} onValueChange={handleKecamatanChange}>
              <SelectTrigger className="h-11 border-2 border-emerald-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-emerald-500 bg-white font-semibold flex items-center justify-between px-3">
                <SelectValue placeholder="Pilih kecamatan" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700 z-[100]">
                {KECAMATAN_LIST.map((kec) => (
                  <SelectItem key={kec} value={kec} className="dark:text-gray-200">{kec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Desa / Kelurahan
            </label>
            <Select value={selectedDesa} onValueChange={setSelectedDesa}>
              <SelectTrigger className="h-11 border-2 border-emerald-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 focus:border-emerald-500 bg-white font-semibold flex items-center justify-between px-3">
                <SelectValue placeholder="Pilih desa" />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-800 dark:border-gray-700 z-[100]">
                {desaList.map((w) => (
                  <SelectItem key={w.kode} value={w.kode} className="dark:text-gray-200">{w.desa}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {bmkgLoading && (
          <div className="flex items-center justify-center py-10 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
            <span className="text-gray-600 dark:text-gray-400 font-semibold">Mengambil data dari BMKG...</span>
          </div>
        )}

        {bmkgError && !bmkgLoading && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-red-800 dark:text-red-400 text-sm">{bmkgError}</p>
            </div>
            <Button size="sm" variant="outline" onClick={fetchBmkg} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 border-2">
              Coba lagi
            </Button>
          </div>
        )}

        {bmkgData && !bmkgLoading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold px-3 py-1">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  {selectedDesaEntry?.desa}, Kec. {selectedDesaEntry?.kecamatan}
                </Badge>
              </div>
            </div>

            {currentForecast && (
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentForecast.image} alt={currentForecast.weather_desc} className="w-16 h-16 object-contain drop-shadow" onError={(e) => (e.currentTarget.style.display = "none")} />
                    <div>
                      <p className="text-4xl font-black">{currentForecast.t}°C</p>
                      <p className="text-emerald-50 font-semibold text-sm">{currentForecast.weather_desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 bg-white/10 rounded-xl p-3 w-full sm:w-auto overflow-x-auto custom-scrollbar">
                    <div className="text-center min-w-[60px]">
                      <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-200" />
                      <p className="font-bold text-sm">{currentForecast.hu}%</p>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center min-w-[70px]">
                      <CloudRain className="w-4 h-4 mx-auto mb-1 text-cyan-200" />
                      <p className="font-bold text-sm">{currentForecast.tp} mm</p>
                    </div>
                    <div className="w-px h-8 bg-white/20"></div>
                    <div className="text-center min-w-[60px]">
                      <Wind className="w-4 h-4 mx-auto mb-1 text-gray-200" />
                      <p className="font-bold text-sm">{currentForecast.ws} m/s</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`transition-all duration-300 ease-in-out ${isBmkgExpanded ? "max-h-[2000px] opacity-100 mt-6" : "max-h-0 opacity-0 overflow-hidden mt-0"}`}>
              {next3Days.length > 0 && (
                <div>
                  <h3 className="font-black text-gray-900 dark:text-gray-100 text-base mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Prakiraan 3 Hari ke Depan
                  </h3>
                  <div className="space-y-3">
                    {next3Days.map((dayForecast, dayIdx) => {
                      const firstEntry = dayForecast[0];
                      if (!firstEntry) return null;
                      return (
                        <div key={dayIdx} className="border-2 border-emerald-100 dark:border-gray-700 rounded-xl overflow-hidden">
                          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 border-b border-emerald-100 dark:border-gray-700">
                            <p className="text-sm font-black text-emerald-800 dark:text-emerald-400">{formatTanggal(firstEntry.local_datetime)}</p>
                          </div>
                          <div className="overflow-x-auto">
                            <div className="flex gap-0 min-w-max">
                              {dayForecast.map((f, idx) => (
                                <div key={idx} className="flex-shrink-0 w-28 p-3 text-center border-r border-gray-100 dark:border-gray-700 last:border-r-0 hover:bg-emerald-50/50 dark:hover:bg-gray-700/50 transition-colors">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-1">{formatJam(f.local_datetime)}</p>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={f.image} alt={f.weather_desc} className="w-8 h-8 mx-auto object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
                                  <p className="text-base font-black text-gray-900 dark:text-gray-100 mt-1">{f.t}°C</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-0.5">{f.weather_desc}</p>
                                  <div className="mt-1.5 flex flex-col gap-0.5">
                                    <span className="text-xs text-blue-500 font-semibold">💧 {f.hu}%</span>
                                    {f.tp > 0 && <span className="text-xs text-cyan-600 font-semibold">🌧 {f.tp} mm</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!bmkgData && !bmkgLoading && !bmkgError && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CloudRain className="w-12 h-12 text-emerald-400 dark:text-emerald-600 mb-3" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Pilih kecamatan dan desa di atas untuk melihat prakiraan cuaca.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
