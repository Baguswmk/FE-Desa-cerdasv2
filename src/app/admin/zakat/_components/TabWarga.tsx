"use client";

import React, { useState, useEffect } from "react";
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Search, Filter, Loader2, Users, Coins, HeartHandshake, ShieldCheck, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

export default function TabWarga() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [mosques, setMosques] = useState<any[]>([]);
  const [selectedMosqueId, setSelectedMosqueId] = useState("");
  const [families, setFamilies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingWarga, setLoadingWarga] = useState(false);

  // Payment Modal/Form
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payFamily, setPayFamily] = useState<any>(null);
  const [payMethod, setPayMethod] = useState<"UANG" | "BERAS">("UANG");
  const [payAmountMoney, setPayAmountMoney] = useState(0);
  const [payAmountRice, setPayAmountRice] = useState(0);
  const [payAdditionalCharity, setPayAdditionalCharity] = useState(0);
  const [savingPayment, setSavingPayment] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [showNiat, setShowNiat] = useState(false);

  // Dynamic calculations based on selected members
  useEffect(() => {
    if (payFamily && selectedMosqueId) {
      const activeMosque = mosques.find(m => m.id === selectedMosqueId);
      if (activeMosque) {
        const count = selectedMembers.length;
        setPayAmountMoney(count * activeMosque.zakatRateMoney);
        setPayAmountRice(count * activeMosque.zakatRateRice);
      }
    }
  }, [selectedMembers, payFamily, selectedMosqueId, mosques]);

  // Distribution Dynamic Modal/Form
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [distBalanceMoney, setDistBalanceMoney] = useState(0);
  const [distBalanceRice, setDistBalanceRice] = useState(0);
  const [distMustahikList, setDistMustahikList] = useState<any[]>([]);
  const [savingDist, setSavingDist] = useState(false);

  useEffect(() => {
    fetchMosques();
  }, []);

  const fetchMosques = async () => {
    try {
      const res = await api.get("/zakat/mosques");
      const data = res.data?.data || [];
      setMosques(data);
      if (data.length > 0) {
        setSelectedMosqueId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedMosqueId) {
      fetchFamilies(selectedMosqueId, searchQuery);
    }
  }, [selectedMosqueId, searchQuery]);

  const fetchFamilies = async (mosqueId: string, query: string) => {
    setLoadingWarga(true);
    try {
      const res = await api.get(`/zakat/search-family?query=${query}&mosqueId=${mosqueId}`);
      setFamilies(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWarga(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Silakan pilih file Excel terlebih dahulu.");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/zakat/import", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        setSuccess("File Excel berhasil di-import! Masjid, wilayah, dan KK Warga telah disimpan.");
        setFile(null);
        toast.success("Data Excel berhasil di-import.");
        fetchMosques();
        if (res.data?.data?.mosqueId) {
          setSelectedMosqueId(res.data.data.mosqueId);
        }
      } else {
        setError(res.data?.message || "Gagal meng-import file Excel.");
        toast.error("Gagal meng-import file Excel.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Terjadi kesalahan saat mengunggah file.");
      toast.error("Gagal meng-import file Excel.");
    } finally {
      setUploading(false);
    }
  };

  const openPaymentForm = (fam: any) => {
    setPayFamily(fam);
    setPayMethod("UANG");
    const activeMosque = mosques.find(m => m.id === selectedMosqueId);
    if (activeMosque) {
      setPayAmountMoney(fam.members.length * activeMosque.zakatRateMoney);
      setPayAmountRice(fam.members.length * activeMosque.zakatRateRice);
    }
    setSelectedMembers(fam.members.map((m: any) => m.id)); // Default all checked
    setShowNiat(false);
    setPayAdditionalCharity(0);
    setShowPaymentModal(true);
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payFamily) return;
    if (selectedMembers.length === 0) {
      toast.error("Pilih minimal 1 anggota keluarga untuk membayar.");
      return;
    }

    setSavingPayment(true);
    try {
      const payerNames = payFamily.members
        .filter((m: any) => selectedMembers.includes(m.id))
        .map((m: any) => m.name)
        .join(", ");

      const payload = {
        familyId: payFamily.id,
        mosqueId: selectedMosqueId,
        paymentType: "ZAKAT_FITRAH",
        method: payMethod,
        amountMoney: payMethod === "UANG" ? payAmountMoney : 0,
        amountRice: payMethod === "BERAS" ? payAmountRice : 0,
        num_people: selectedMembers.length,
        payer_name: payerNames,
      };

      await api.post("/zakat/payments/direct", payload);

      // Record additional charity if any
      if (payAdditionalCharity > 0) {
        await api.post("/zakat/payments/direct", {
          familyId: payFamily.id,
          mosqueId: selectedMosqueId,
          paymentType: "SEDEKAH",
          method: "UANG",
          amountMoney: payAdditionalCharity,
          payer_name: `Sedekah - ${payFamily.members.find((m: any) => m.relationship === "KEPALA_KELUARGA")?.name || 'Keluarga'}`,
        });
      }

      toast.success("Pembayaran berhasil dicatat.");
      setShowPaymentModal(false);
      fetchFamilies(selectedMosqueId, searchQuery);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mencatat pembayaran");
    } finally {
      setSavingPayment(false);
    }
  };

  const openDistributeForm = async () => {
    if (!selectedMosqueId) return;
    setLoadingWarga(true);
    try {
      const res = await api.get(`/zakat/distributions/calculate-dynamic?mosqueId=${selectedMosqueId}`);
      const data = res.data?.data;
      setDistBalanceMoney(data.balanceMoney);
      setDistBalanceRice(data.balanceRice);
      setDistMustahikList(data.mustahikFamilies.map((fam: any) => ({
        ...fam,
        allocatedMoney: fam.recommendedMoney,
        allocatedRice: fam.recommendedRice,
        method: "KEDUA"
      })));
      setShowDistributeModal(true);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengambil kas & mustahik.");
    } finally {
      setLoadingWarga(false);
    }
  };

  const handleAllocatedChange = (index: number, field: string, value: number) => {
    const updated = [...distMustahikList];
    updated[index][field] = Number(value);
    setDistMustahikList(updated);
  };

  const handleAllocatedMethodChange = (index: number, val: string) => {
    const updated = [...distMustahikList];
    updated[index].method = val;
    setDistMustahikList(updated);
  };

  // Real-time dynamic checks
  const totalAllocatedMoney = distMustahikList.reduce((sum, item) => {
    if (item.method === "BERAS") return sum;
    return sum + item.allocatedMoney;
  }, 0);

  const totalAllocatedRice = distMustahikList.reduce((sum, item) => {
    if (item.method === "UANG") return sum;
    return sum + item.allocatedRice;
  }, 0);

  const isMoneyOverBudget = totalAllocatedMoney > distBalanceMoney;
  const isRiceOverBudget = totalAllocatedRice > distBalanceRice;

  const handleSaveDistribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (distMustahikList.length === 0) return;
    if (isMoneyOverBudget || isRiceOverBudget) {
      toast.error("Penyaluran melebihi sisa kas!");
      return;
    }

    setSavingDist(true);
    try {
      const payload = {
        mosqueId: selectedMosqueId,
        distributions: distMustahikList.map(fam => ({
          familyId: fam.id,
          method: fam.method,
          amountMoney: fam.method !== "BERAS" ? fam.allocatedMoney : 0,
          amountRice: fam.method !== "UANG" ? fam.allocatedRice : 0,
        }))
      };

      const res = await api.post("/zakat/distributions/dynamic", payload);

      if (res.data?.success) {
        toast.success("Penyaluran zakat massal berhasil diproses!");
        setShowDistributeModal(false);
      } else {
        toast.error("Gagal menyalurkan zakat.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memproses penyaluran.");
    } finally {
      setSavingDist(false);
    }
  };

  const filteredFamilies = families.filter(fam => {
    if (statusFilter === "ALL") return true;
    return fam.status === statusFilter;
  });

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4 dark:border-gray-700">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Manajemen Warga & Lokasi Syariah
          </h2>
          <p className="text-sm text-gray-500">
            Kelola data Kartu Keluarga, pencatatan langsung, dan bagi rata mustahik.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select
            value={selectedMosqueId}
            onChange={(e) => setSelectedMosqueId(e.target.value)}
            className="border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:border-emerald-500 dark:bg-gray-800 text-sm"
          >
            {mosques.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <Button
            onClick={openDistributeForm}
            disabled={!selectedMosqueId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 mr-2" /> Penyaluran Adil
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Dropzone Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-emerald-50/20 dark:bg-emerald-950/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 space-y-4">
            <h3 className="font-extrabold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Import Data Excel
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mendaftarkan data KK secara massal tingkat RT/RW dan mengaitkannya ke cakupan masjid aktif secara otomatis.
            </p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-6 text-center hover:bg-gray-50 hover:dark:bg-gray-950 transition-colors">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {file ? file.name : "Seret & Letakkan template Excel"}
                </span>
                <span className="block text-[10px] text-gray-400 mt-1">Hanya mendukung .xlsx</span>
              </div>

              {error && (
                <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={uploading || !file}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Mengunggah...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload Excel Warga
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Warga List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari KK / Nama Kepala Keluarga..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 pl-10 pr-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                <option value="ALL">Semua Warga</option>
                <option value="MUZAKKI">Muzakki</option>
                <option value="MUSTAHIK">Mustahik</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {loadingWarga ? (
              <div className="py-12 text-center text-sm text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mr-2" /> Memuat data...
              </div>
            ) : filteredFamilies.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                Belum ada data warga terdaftar. Silakan import Excel tingkat RT/RW.
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">No KK</th>
                    <th className="px-4 py-3">Kepala Keluarga</th>
                    <th className="px-4 py-3">RT/RW</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredFamilies.map((fam) => {
                    const headName = fam.members.find((m: any) => m.relationship === "KEPALA_KELUARGA")?.name || "Kepala Keluarga";
                    return (
                      <tr key={fam.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{fam.noKK}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-gray-900 dark:text-gray-100">{headName}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{fam.soulCount} Jiwa wajib zakat</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">{fam.region?.name} ({fam.region?.parent?.name})</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            fam.status === "MUZAKKI"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
                          }`}>
                            {fam.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {fam.status === "MUZAKKI" && (
                            <Button
                              onClick={() => openPaymentForm(fam)}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                            >
                              <Coins className="w-3.5 h-3.5 mr-1" /> Catat Bayar
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
       Direct Payment Modal
       ═══════════════════════════════════════════════════════════════ */}
      {showPaymentModal && payFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-600" />
                Catat Pembayaran Zakat Fitrah
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl">&times;</button>
            </div>

            <div className="text-sm bg-emerald-50/10 dark:bg-emerald-950/5 border border-emerald-100/30 dark:border-emerald-900/30 p-4 rounded-xl space-y-1.5">
              <div><span className="font-semibold text-gray-500">Nama Kepala Keluarga:</span> <span className="font-bold text-gray-800 dark:text-gray-200">{payFamily.members.find((m: any) => m.relationship === "KEPALA_KELUARGA")?.name || "Kepala Keluarga"}</span></div>
              <div><span className="font-semibold text-gray-500">Nomor KK:</span> <span className="font-mono font-bold text-xs">{payFamily.noKK}</span></div>
              <div className="flex justify-between items-center pt-1 border-t dark:border-gray-700/50 mt-1">
                <span className="font-semibold text-gray-500">Total Wajib Zakat:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full text-xs">{payFamily.soulCount} Jiwa Terdaftar</span>
              </div>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4">
              {/* Member Selection Checklist */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Pilih Anggota Keluarga yang Membayar ({selectedMembers.length} Jiwa)</label>
                <div className="border border-gray-100 dark:border-gray-700 rounded-xl p-3 bg-gray-50/50 dark:bg-gray-900/30 max-h-[160px] overflow-y-auto space-y-2 custom-scrollbar">
                  {payFamily.members.map((member: any) => {
                    const isChecked = selectedMembers.includes(member.id);
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${
                          isChecked 
                            ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50" 
                            : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                            } else {
                              setSelectedMembers([...selectedMembers, member.id]);
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1 flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-800 dark:text-gray-200">{member.name}</span>
                          <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-500 dark:text-gray-400 uppercase font-mono">
                            {member.relationship === "KEPALA_KELUARGA" ? "KK" : member.relationship.replace("_", " ")}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-400 italic">
                  * Ambil/Ubah pilihan di atas untuk menyesuaikan jumlah jiwa pembayar zakat secara dinamis.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Metode Setoran Zakat</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPayMethod("UANG")}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                      payMethod === "UANG" ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50/50"
                    }`}
                  >
                    Setoran Uang
                    <span className="font-normal text-[10px] text-gray-400 mt-0.5">{formatRupiah(payAmountMoney)}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("BERAS")}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                      payMethod === "BERAS" ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50/50"
                    }`}
                  >
                    Setoran Beras
                    <span className="font-normal text-[10px] text-gray-400 mt-0.5">{payAmountRice} kg</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Sedekah / Infaq Tambahan (Rp)</label>
                <Input
                  type="number"
                  placeholder="Opsional, contoh: 10000"
                  value={payAdditionalCharity === 0 ? "" : payAdditionalCharity}
                  onChange={(e) => setPayAdditionalCharity(Number(e.target.value))}
                />
              </div>

              {/* Dynamic Lafadz Niat Zakat Card */}
              {selectedMembers.length > 0 && (
                <div className="border-t border-dashed dark:border-gray-700 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNiat(!showNiat)}
                    className="flex items-center justify-between w-full p-2 bg-emerald-50/30 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-colors text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Lafadz Niat Zakat Fitrah ({selectedMembers.length === 1 ? "1 Orang" : `${selectedMembers.length} Orang`})
                    </span>
                    <span>{showNiat ? "Sembunyikan" : "Tampilkan Niat"}</span>
                  </button>

                  {showNiat && (
                    <div className="mt-3 bg-emerald-50/40 dark:bg-emerald-950/15 border border-emerald-100/50 dark:border-emerald-900/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
                      <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 text-emerald-100/30 dark:text-emerald-900/20 pointer-events-none">
                        <Sparkles className="w-24 h-24" />
                      </div>

                      <div className="text-right font-serif text-lg md:text-xl font-medium text-emerald-950 dark:text-emerald-100 leading-loose">
                        {selectedMembers.length === 1 
                          ? "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِيْ فَرْضًا لِلّٰهِ تَعَالَى"
                          : "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنِّيْ وَعَنْ جَمِيْعِ مَا يَلْزَمُنِيْ نَفَقَاتُهُمْ شَرْعًا فَرْضًا لِلّٰهِ تَعَالَى"
                        }
                      </div>

                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Cara Baca (Transliterasi)</div>
                        <div className="text-xs italic text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                          {selectedMembers.length === 1
                            ? '"Nawaitu an ukhrija zakaatal fithri \'an nafsii fardhan lillaahi ta\'aalaa."'
                            : '"Nawaitu an ukhrija zakaatal fithri \'annii wa \'an jamii\'i maa yalzamunii nafaqaatuhum syar\'an fardhan lillaahi ta\'aalaa."'
                          }
                        </div>
                      </div>

                      <div className="space-y-1.5 border-t border-emerald-100/50 dark:border-emerald-900/30 pt-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Terjemahan</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {selectedMembers.length === 1
                            ? "“Aku niat mengeluarkan zakat fitrah untuk diriku sendiri, fardhu karena Allah Ta'ala.”"
                            : "“Aku niat mengeluarkan zakat fitrah untuk diriku dan seluruh orang yang nafkahnya menjadi tanggunganku secara syar'i, fardhu karena Allah Ta'ala.”"
                          }
                        </div>
                      </div>
                  </div>
                )}
              </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t dark:border-gray-700">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)} className="cursor-pointer">Batal</Button>
                <Button type="submit" disabled={savingPayment || selectedMembers.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
                  {savingPayment ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Simpan Pembayaran
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
       Equal Share Dynamic Penyaluran Modal
       ═══════════════════════════════════════════════════════════════ */}
      {showDistributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b pb-3 dark:border-gray-700 shrink-0">
              <h3 className="text-lg font-extrabold flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                Penyaluran Adil Dinamis (RT/RW Cakupan)
              </h3>
              <button onClick={() => setShowDistributeModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">&times;</button>
            </div>

            {/* Balances */}
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl my-4 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Sisa Kas Uang</span>
                <span className="text-lg font-extrabold text-gray-800 dark:text-gray-100">{formatRupiah(distBalanceMoney)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Sisa Kas Beras</span>
                <span className="text-lg font-extrabold text-gray-800 dark:text-gray-100">{distBalanceRice} kg</span>
              </div>
            </div>

            {/* Mustahik dynamic edit list */}
            <form onSubmit={handleSaveDistribution} className="flex-1 flex flex-col overflow-hidden min-h-0 space-y-4">
              <div className="overflow-y-auto flex-1 border border-gray-100 dark:border-gray-700 rounded-xl custom-scrollbar">
                {distMustahikList.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-500">Belum ada KK Mustahik terdaftar di cakupan wilayah masjid ini.</div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-gray-505 uppercase text-[10px] tracking-wider sticky top-0 z-10">
                      <tr className="border-b dark:border-gray-700">
                        <th className="p-3 font-semibold">KK Mustahik</th>
                        <th className="p-3 font-semibold">Lokasi</th>
                        <th className="p-3 font-semibold w-32">Metode</th>
                        <th className="p-3 font-semibold">Uang (Rp)</th>
                        <th className="p-3 font-semibold">Beras (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {distMustahikList.map((fam, index) => (
                        <tr key={fam.id} className="hover:bg-gray-50/20">
                          <td className="p-3">
                            <div className="font-bold text-gray-800 dark:text-gray-200">{fam.headName}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">{fam.soulCount} Jiwa</div>
                          </td>
                          <td className="p-3 text-xs text-gray-500">{fam.rt}</td>
                          <td className="p-3">
                            <select
                              value={fam.method}
                              onChange={(e) => handleAllocatedMethodChange(index, e.target.value)}
                              className="w-full rounded-lg border px-2 py-1 text-xs focus:outline-none dark:bg-gray-900"
                            >
                              <option value="KEDUA">Uang & Beras</option>
                              <option value="UANG">Hanya Uang</option>
                              <option value="BERAS">Hanya Beras</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              disabled={fam.method === "BERAS"}
                              value={fam.allocatedMoney}
                              onChange={(e) => handleAllocatedChange(index, "allocatedMoney", Number(e.target.value))}
                              className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none dark:bg-gray-900 disabled:opacity-40"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              disabled={fam.method === "UANG"}
                              value={fam.allocatedRice}
                              onChange={(e) => handleAllocatedChange(index, "allocatedRice", Number(e.target.value))}
                              className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none dark:bg-gray-900 disabled:opacity-40"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Status and dynamic budgeting calculations */}
              {distMustahikList.length > 0 && (
                <div className="border-t pt-4 dark:border-gray-700 shrink-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="text-xs space-y-1">
                    <div className="flex items-center gap-1.5">
                      {isMoneyOverBudget ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      <span className="text-gray-400">Total Uang Dialokasikan:</span>
                      <span className={`font-bold ${isMoneyOverBudget ? "text-red-500" : "text-gray-800 dark:text-gray-100"}`}>{formatRupiah(totalAllocatedMoney)}</span>
                      <span className="text-gray-400">/ Kas: {formatRupiah(distBalanceMoney)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isRiceOverBudget ? <ShieldAlert className="w-4 h-4 text-red-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                      <span className="text-gray-400">Total Beras Dialokasikan:</span>
                      <span className={`font-bold ${isRiceOverBudget ? "text-red-500" : "text-gray-800 dark:text-gray-100"}`}>{totalAllocatedRice} kg</span>
                      <span className="text-gray-400">/ Kas: {distBalanceRice} kg</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowDistributeModal(false)} className="cursor-pointer">Batal</Button>
                    <Button
                      type="submit"
                      disabled={savingDist || isMoneyOverBudget || isRiceOverBudget}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                    >
                      {savingDist ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Salurkan Zakat Adil
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
