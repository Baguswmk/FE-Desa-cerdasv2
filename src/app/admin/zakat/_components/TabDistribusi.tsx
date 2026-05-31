"use client";

import { useEffect, useState } from "react";
import {
  zakatService,
  ZakatPeriod,
  ZakatDistribution,
} from "@/services/zakat.service";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Users, Upload, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TabDistribusi() {
  const [periods, setPeriods] = useState<ZakatPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [distributions, setDistributions] = useState<ZakatDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    mustahik_name: "",
    mustahik_nik: "", // opsional
    mustahik_category: "FAKIR",
    amount: "",
    description: "",
  });
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    zakatService
      .getPeriods(1, 50)
      .then((res) => {
        const p = res.data?.data || [];
        const active = p.filter((x: any) => x.status === "ACTIVE");
        setPeriods(active.length > 0 ? active : p);
        if (p.length > 0)
          setSelectedPeriod(active.length > 0 ? active[0].id : p[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      zakatService.getDistributions(selectedPeriod).then((res) => {
        setDistributions(res.data?.data || []);
      });
    }
  }, [selectedPeriod, showForm]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("period_id", selectedPeriod);
      fd.append("mustahik_name", formData.mustahik_name);
      if (formData.mustahik_nik)
        fd.append("mustahik_nik", formData.mustahik_nik);
      fd.append("mustahik_category", formData.mustahik_category);
      fd.append("amount", formData.amount);
      if (formData.description) fd.append("description", formData.description);
      if (buktiFile) fd.append("bukti_distribusi", buktiFile);

      const res = await zakatService.createDistribution(fd);
      if (res.data?.dtks?.source === "dtks") {
        toast.error("Penyaluran dicatat dan tervalidasi DTKS!");
      } else {
        toast.error("Penyaluran dicatat secara manual (tanpa DTKS).");
      }
      setShowForm(false);
      setFormData({
        mustahik_name: "",
        mustahik_nik: "",
        mustahik_category: "FAKIR",
        amount: "",
        description: "",
      });
      setBuktiFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan penyaluran");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Distribusi Zakat
          </h2>
          <p className="text-sm text-gray-500">
            Penyaluran kepada Mustahik (8 Asnaf)
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:border-emerald-500 dark:bg-gray-800"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Catat Penyaluran
            </Button>
          )}
        </div>
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50 space-y-4 max-w-3xl mx-auto"
        >
          <h3 className="font-bold text-lg mb-2">Form Penyaluran Baru</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Nama Mustahik *
              </label>
              <Input
                required
                value={formData.mustahik_name}
                onChange={(e) =>
                  setFormData({ ...formData, mustahik_name: e.target.value })
                }
                placeholder="Nama Penerima"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                NIK (Opsional - Untuk DTKS)
              </label>
              <Input
                value={formData.mustahik_nik}
                onChange={(e) =>
                  setFormData({ ...formData, mustahik_nik: e.target.value })
                }
                placeholder="16 Digit NIK"
                maxLength={16}
              />
              <p className="text-[10px] text-gray-500 mt-0.5">
                Disimpan dalam format hash untuk keamanan privasi.
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Kategori Asnaf
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                value={formData.mustahik_category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mustahik_category: e.target.value,
                  })
                }
              >
                <option value="FAKIR">Fakir</option>
                <option value="MISKIN">Miskin</option>
                <option value="AMIL">Amil</option>
                <option value="MUALAF">Mualaf</option>
                <option value="RIQAB">Riqab (Hamba Sahaya)</option>
                <option value="GHARIMIN">Gharimin (Banyak Hutang)</option>
                <option value="FISABILILLAH">
                  Fi Sabilillah (Di Jalan Allah)
                </option>
                <option value="IBNU_SABIL">Ibnu Sabil (Musafir)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Nominal (Rp) *
              </label>
              <Input
                required
                type="number"
                min={1000}
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="500000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Keterangan / Bantuan Barang
            </label>
            <Input
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Contoh: Bantuan modal usaha ayam petelur"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Foto Bukti Penyerahan (Opsional)
            </label>
            <label className="flex items-center gap-3 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <Upload className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {buktiFile ? buktiFile.name : "Upload foto dokumentasi"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBuktiFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserCheck className="w-4 h-4 mr-2" />
              )}
              Top Up
            </Button>
          </div>
        </form>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Nama Mustahik</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold text-right">Nominal</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {distributions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    Belum ada penyaluran pada periode ini.
                  </td>
                </tr>
              ) : (
                distributions.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />{" "}
                      {d.mustahik_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-100 dark:bg-gray-700 text-xs px-2 py-1 rounded font-medium">
                        {d.mustahik_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">
                      {formatCurrency(d.amount)}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(d.distributed_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs truncate max-w-[200px]">
                      {d.description || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
