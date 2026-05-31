"use client";

import { useState, useEffect } from "react";
import { zakatService, ZakatPeriod, ZakatDistribution } from "@/services/zakat.service";
import { Users, ChevronDown } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  FAKIR: "Fakir",
  MISKIN: "Miskin",
  AMIL: "Amil",
  MUALAF: "Mualaf",
  RIQAB: "Riqab",
  GHARIMIN: "Gharimin",
  FISABILILLAH: "Fi Sabilillah",
  IBNU_SABIL: "Ibnu Sabil",
};

export default function ZakatTransparency() {
  const [periods, setPeriods] = useState<ZakatPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [periodDetail, setPeriodDetail] = useState<ZakatPeriod | null>(null);
  const [distributions, setDistributions] = useState<ZakatDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    zakatService.getActivePeriods().then((res) => {
      const data = res.data || [];
      setPeriods(data);
      if (data.length > 0) setSelectedPeriod(data[0].id);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedPeriod) return;
    zakatService.getPeriodById(selectedPeriod).then((res) => setPeriodDetail(res.data)).catch(() => {});
    zakatService.getDistributions(selectedPeriod).then((res) => setDistributions(res.data?.data || [])).catch(() => {});
  }, [selectedPeriod]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  if (loading) {
    return <div className="py-12 text-center text-gray-500 dark:text-gray-400">Memuat data...</div>;
  }

  if (periods.length === 0) {
    return <div className="py-12 text-center text-gray-500 dark:text-gray-400">Belum ada periode zakat.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="relative">
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none appearance-none font-semibold"
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <ChevronDown className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>

      {/* Stats cards */}
      {periodDetail && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold mb-1">Terkumpul</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
              {formatCurrency(Number(periodDetail.collected_amount || 0))}
            </p>
          </div>
          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-center">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-1">Tersalurkan</p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
              {formatCurrency(Number(periodDetail.distributed_amount || 0))}
            </p>
          </div>
          <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-center">
            <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold mb-1">Penerima</p>
            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {periodDetail._count?.distributions || 0}
            </p>
          </div>
        </div>
      )}

      {/* Distribution list */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Daftar Penyaluran
        </h3>
        {distributions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada data penyaluran.</p>
        ) : (
          <div className="space-y-3">
            {distributions.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{d.mustahik_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
                      {CATEGORY_LABELS[d.mustahik_category] || d.mustahik_category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(d.distributed_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
                <p className="font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(Number(d.amount))}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
