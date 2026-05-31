"use client";

import { useState, useEffect } from "react";
import { zakatService, ZakatPeriod } from "@/services/zakat.service";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Upload, CheckCircle } from "lucide-react";

interface ZakatPaymentFormProps {
  defaultAmount?: number;
  defaultType?: "FITRAH" | "MAAL" | "PENGHASILAN";
}

export default function ZakatPaymentForm({ defaultAmount, defaultType }: ZakatPaymentFormProps) {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<ZakatPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [payerName, setPayerName] = useState(user?.nama || "");
  const [zakatType, setZakatType] = useState<string>(defaultType || "FITRAH");
  const [amount, setAmount] = useState<number>(defaultAmount || 0);
  const [numPeople, setNumPeople] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [buktiFile, setBuktiFile] = useState<File | null>(null);

  useEffect(() => {
    zakatService.getActivePeriods().then((res) => {
      const data = res.data || [];
      setPeriods(data);
      if (data.length > 0) {
        // Auto-select period matching type
        const match = data.find((p: ZakatPeriod) => p.type === (defaultType || "FITRAH"));
        setSelectedPeriod(match?.id || data[0].id);
      }
    }).catch(() => {});
  }, [defaultType]);

  useEffect(() => {
    if (user?.nama && !payerName) setPayerName(user.nama);
  }, [user]);

  useEffect(() => {
    if (defaultAmount) setAmount(defaultAmount);
    if (defaultType) setZakatType(defaultType);
  }, [defaultAmount, defaultType]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buktiFile || !selectedPeriod) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("period_id", selectedPeriod);
      formData.append("payer_name", payerName);
      formData.append("zakat_type", zakatType);
      formData.append("amount", amount.toString());
      if (zakatType === "FITRAH") formData.append("num_people", numPeople.toString());
      if (message) formData.append("message", message);
      formData.append("bukti_transfer", buktiFile);

      await zakatService.createPayment(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal mengirim pembayaran");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pembayaran Berhasil Dikirim!</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          Pembayaran zakat Anda sebesar <strong className="text-emerald-600">{formatCurrency(amount)}</strong> sedang menunggu verifikasi admin.
        </p>
        <button
          onClick={() => { setSuccess(false); setBuktiFile(null); setAmount(0); }}
          className="mt-4 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all"
        >
          Bayar Lagi
        </button>
      </div>
    );
  }

  if (periods.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Belum ada periode zakat yang aktif saat ini.</p>
      </div>
    );
  }

  const activePeriod = periods.find((p) => p.id === selectedPeriod);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Period selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Periode Zakat</label>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none"
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Bank info */}
      {activePeriod?.bank_name && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl space-y-1">
          <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Info Transfer:</p>
          <p className="text-sm text-blue-600 dark:text-blue-300">{activePeriod.bank_name} — {activePeriod.bank_account_number}</p>
          <p className="text-sm text-blue-600 dark:text-blue-300">a.n. {activePeriod.bank_account_name}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Muzakki</label>
          <input
            type="text"
            value={payerName}
            onChange={(e) => setPayerName(e.target.value)}
            required
            minLength={3}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jenis Zakat</label>
          <select
            value={zakatType}
            onChange={(e) => setZakatType(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none"
          >
            <option value="FITRAH">Zakat Fitrah</option>
            <option value="MAAL">Zakat Maal</option>
            <option value="PENGHASILAN">Zakat Penghasilan</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jumlah (Rp)</label>
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            min={1000}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>
        {zakatType === "FITRAH" && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jumlah Jiwa</label>
            <input
              type="number"
              value={numPeople}
              onChange={(e) => setNumPeople(Number(e.target.value))}
              min={1}
              max={100}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pesan (Opsional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={2}
          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none resize-none"
          placeholder="Semoga diterima..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bukti Transfer *</label>
        <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 transition-all bg-gray-50 dark:bg-gray-800/50">
          <Upload className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {buktiFile ? buktiFile.name : "Klik untuk upload bukti transfer (JPG/PNG, maks 5MB)"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={(e) => setBuktiFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !buktiFile || !amount}
        className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : "Kirim Pembayaran Zakat"}
      </button>
    </form>
  );
}
