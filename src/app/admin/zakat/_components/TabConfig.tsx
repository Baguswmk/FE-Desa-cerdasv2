"use client";

import { useEffect, useState } from "react";
import { zakatService, ZakatConfig } from "@/services/zakat.service";
import { Button } from "@/components/ui/button";
import { Loader2, Save, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
export default function TabConfig() {
  const [configs, setConfigs] = useState<ZakatConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Local state to track changes before save
  const [values, setValues] = useState<Record<string, string>>({});

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const res = await zakatService.getConfigs();
      const loaded: ZakatConfig[] = res.data || [];
      if (loaded.length === 0) {
        // If empty, seed values
        await zakatService.seedConfigs();
        const seededRes = await zakatService.getConfigs();
        setConfigs(seededRes.data || []);
        initValues(seededRes.data || []);
      } else {
        setConfigs(loaded);
        initValues(loaded);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initValues = (cfgs: ZakatConfig[]) => {
    const v: Record<string, string> = {};
    cfgs.forEach((c) => (v[c.key] = c.value));
    setValues(v);
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleSave = async (key: string) => {
    setSaving(key);
    try {
      await zakatService.updateConfig(key, values[key]);
      // Small toast or visual cue could go here
    } catch (err) {
      toast.error("Gagal menyimpan " + key);
    } finally {
      setSaving(null);
    }
  };

  const formatRupiah = (val: string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="border-b pb-4 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Konfigurasi Zakat
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Ubah harga emas, harga beras, dan persentase yang akan digunakan
          kalkulator sisi-klien warga.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {configs.map((c) => (
          <div
            key={c.key}
            className="p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="font-bold text-gray-800 dark:text-gray-200">
                  {c.label}
                </label>
                <span className="text-xs font-mono bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-500">
                  {c.key}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  className="flex-1 font-mono"
                  value={values[c.key] || ""}
                  onChange={(e) =>
                    setValues({ ...values, [c.key]: e.target.value })
                  }
                />
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">
                  {c.unit}
                </span>
              </div>
              {c.unit?.includes("Rp") && values[c.key] && (
                <p className="text-xs text-emerald-600 mt-2 font-medium">
                  {formatRupiah(values[c.key])}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => handleSave(c.key)}
                disabled={saving === c.key || values[c.key] === c.value}
                size="sm"
                className="bg-gray-800 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 transition-all text-white"
              >
                {saving === c.key ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {values[c.key] === c.value ? "Tersimpan" : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3 text-amber-800 dark:text-amber-400">
        <Info className="w-5 h-5 shrink-0" />
        <p className="text-sm">
          <strong>Perhatian:</strong> Perubahan konfigurasi di sini akan
          langsung mempengaruhi perhitungan zakat seluruh warga di halaman
          kalkulator secara real-time. Pastikan Anda memasukkan harga pasar emas
          murni dan beras lokal terkini.
        </p>
      </div>
    </div>
  );
}
