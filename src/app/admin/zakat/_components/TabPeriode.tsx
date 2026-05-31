"use client";

import { useEffect, useState } from "react";
import { zakatService, ZakatPeriod } from "@/services/zakat.service";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Calendar, Edit2, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TabPeriode() {
  const [periods, setPeriods] = useState<ZakatPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    type: "FITRAH",
    start_date: "",
    end_date: "",
    target_amount: "",
    status: "ACTIVE",
    bank_name: "",
    bank_account_number: "",
    bank_account_name: "",
  });

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const res = await zakatService.getPeriods(1, 20);
      setPeriods(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPeriods();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      target_amount: formData.target_amount
        ? Number(formData.target_amount)
        : undefined,
      start_date: new Date(formData.start_date).toISOString(),
      end_date: new Date(formData.end_date).toISOString(),
    };

    try {
      if (isEditing) {
        await zakatService.updatePeriod(isEditing, payload);
      } else {
        await zakatService.createPeriod(payload);
      }
      setShowForm(false);
      setIsEditing(null);
      loadPeriods();
    } catch (err) {
      toast.error("Gagal menyimpan periode");
    }
  };

  const editPeriod = (p: ZakatPeriod) => {
    setFormData({
      title: p.title,
      type: p.type,
      start_date: new Date(p.start_date).toISOString().slice(0, 16), // datetime-local format
      end_date: new Date(p.end_date).toISOString().slice(0, 16),
      target_amount: p.target_amount ? String(p.target_amount) : "",
      status: p.status,
      bank_name: p.bank_name || "",
      bank_account_number: p.bank_account_number || "",
      bank_account_name: p.bank_account_name || "",
    });
    setIsEditing(p.id);
    setShowForm(true);
  };

  if (loading && periods.length === 0) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Daftar Periode Zakat
        </h2>
        {!showForm && (
          <Button
            onClick={() => {
              setFormData({
                title: "",
                type: "FITRAH",
                start_date: "",
                end_date: "",
                target_amount: "",
                status: "ACTIVE",
                bank_name: "",
                bank_account_number: "",
                bank_account_name: "",
              });
              setIsEditing(null);
              setShowForm(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Buat Periode
          </Button>
        )}
      </div>

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4"
        >
          <h3 className="font-bold text-lg mb-4">
            {isEditing ? "Edit Periode" : "Buat Periode Baru"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">
                Judul Periode *
              </label>
              <Input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Contoh: Zakat Fitrah 1447H"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Jenis Zakat
              </label>
              <select
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="FITRAH">Fitrah</option>
                <option value="MAAL">Maal</option>
                <option value="PENGHASILAN">Penghasilan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Mulai *
              </label>
              <Input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Akhir *
              </label>
              <Input
                type="datetime-local"
                required
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
            {isEditing && (
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-900 dark:border-gray-700"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="ACTIVE">Aktif</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="CANCELLED">Dibatalkan</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold mb-1">
                Target Pengumpulan (Rp)
              </label>
              <Input
                type="number"
                value={formData.target_amount}
                onChange={(e) =>
                  setFormData({ ...formData, target_amount: e.target.value })
                }
                placeholder="Opsional"
              />
            </div>
          </div>

          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mt-6 border-b pb-2">
            Informasi Bank (Opsional)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
            <div>
              <label className="block text-sm mb-1">Nama Bank</label>
              <Input
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                placeholder="BSI"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">No. Rekening</label>
              <Input
                value={formData.bank_account_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_account_number: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Atas Nama</label>
              <Input
                value={formData.bank_account_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bank_account_name: e.target.value,
                  })
                }
              />
            </div>
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
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Simpan Periode
            </Button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {periods.map((p) => (
            <div
              key={p.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-start mb-3">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    p.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : p.status === "COMPLETED"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800/80 dark:text-gray-400"
                  }`}
                >
                  {p.status}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-emerald-600"
                  onClick={() => editPeriod(p)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="font-bold text-lg mb-1">{p.title}</h3>
              <p className="text-xs text-gray-500 mb-4">{p.type}</p>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 min-w-4" />
                  <span className="truncate">
                    {new Date(p.start_date).toLocaleDateString("id")} -{" "}
                    {new Date(p.end_date).toLocaleDateString("id")}
                  </span>
                </div>
                {p.target_amount && (
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 min-w-4" />
                    <span>
                      Target: {formatCurrency(Number(p.target_amount))}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
                <div className="text-center">
                  <p className="text-gray-500 text-xs">Pemasukan</p>
                  <p className="font-bold text-emerald-600">
                    {p._count?.payments || 0}
                  </p>
                </div>
                <div className="text-center border-l dark:border-gray-700 pl-4">
                  <p className="text-gray-500 text-xs">Penyaluran</p>
                  <p className="font-bold text-blue-600">
                    {p._count?.distributions || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
