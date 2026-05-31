"use client";

import { useState, useEffect } from "react";
import { zakatService, ZakatConfig } from "@/services/zakat.service";
import { Search, Users, AlertCircle, Coins, Sparkles, Check, Keyboard, Loader2 } from "lucide-react";

type ZakatCalcType = "FITRAH" | "MAAL" | "PENGHASILAN";

interface CalcResult {
  type: ZakatCalcType;
  amount: number;
  details: string;
}

function getConfigValue(configs: ZakatConfig[], key: string): number {
  const c = configs.find((x) => x.key === key);
  return c ? parseFloat(c.value) : 0;
}

export default function ZakatCalculator({
  onPayNow,
}: {
  onPayNow: (amount: number, type: ZakatCalcType) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<ZakatCalcType>("FITRAH");
  const [configs, setConfigs] = useState<ZakatConfig[]>([]);
  const [result, setResult] = useState<CalcResult | null>(null);

  // Fitrah inputs
  const [numPeople, setNumPeople] = useState(1);
  const [fitrahMode, setFitrahMode] = useState<"MANUAL" | "KK">("MANUAL");
  const [kkInput, setKkInput] = useState("");
  const [loadingKK, setLoadingKK] = useState(false);
  const [kkResult, setKkResult] = useState<any | null>(null);
  const [localRicePrice, setLocalRicePrice] = useState<number>(0);
  const [selectedKKMembers, setSelectedKKMembers] = useState<string[]>([]);
  const [kkError, setKkError] = useState<string | null>(null);

  // Maal inputs
  const [totalHarta, setTotalHarta] = useState<number>(0);
  const [totalHutang, setTotalHutang] = useState<number>(0);
  // Penghasilan inputs
  const [gajiBulanan, setGajiBulanan] = useState<number>(0);

  useEffect(() => {
    zakatService.getConfigs().then((res) => {
      const data = res.data || [];
      setConfigs(data);
      const defaultBerasPrice = getConfigValue(data, "harga_beras_per_kg");
      if (defaultBerasPrice > 0) {
        setLocalRicePrice(defaultBerasPrice);
      }
    }).catch(() => {});
  }, []);

  const hargaEmas = getConfigValue(configs, "harga_emas_per_gram");
  const hargaBeras = getConfigValue(configs, "harga_beras_per_kg");
  const nisabGram = getConfigValue(configs, "nisab_emas_gram");
  const kadarZakat = getConfigValue(configs, "kadar_zakat_persen");
  const berasPerJiwa = getConfigValue(configs, "beras_per_jiwa_kg");

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const handleLookupKK = async () => {
    if (!kkInput.trim() || kkInput.length < 5) {
      setKkError("Masukkan Nomor KK yang valid.");
      return;
    }
    setLoadingKK(true);
    setKkError(null);
    setKkResult(null);
    try {
      const res = await zakatService.publicLookupFamily(kkInput.trim());
      if (res.success && res.data) {
        setKkResult(res.data);
        setSelectedKKMembers(res.data.members.map((m: any) => m.id));
        setLocalRicePrice(res.data.zakatRateMoney / res.data.zakatRateRice);
      } else {
        setKkError("Nomor KK tidak terdaftar di database desa.");
      }
    } catch (err: any) {
      console.error(err);
      setKkError(err.response?.data?.message || "Data KK tidak ditemukan.");
    } finally {
      setLoadingKK(false);
    }
  };

  const calculate = () => {
    let amount = 0;
    let details = "";

    if (type === "FITRAH") {
      if (fitrahMode === "KK" && kkResult) {
        const count = selectedKKMembers.length;
        amount = count * berasPerJiwa * localRicePrice;
        const memberNames = kkResult.members
          .filter((m: any) => selectedKKMembers.includes(m.id))
          .map((m: any) => m.name)
          .join(", ");
        details = `Data Warga:\nNomor KK: ${kkResult.noKK}\nCakupan Masjid: ${kkResult.mosqueName}\n\nPembayar (${count} Jiwa):\n${memberNames}\n\nKalkulasi Syariah:\n${count} jiwa × ${berasPerJiwa} kg/jiwa × ${formatCurrency(localRicePrice)}/kg = ${formatCurrency(amount)}\nBeras: ${count * berasPerJiwa} kg`;
      } else {
        amount = numPeople * berasPerJiwa * localRicePrice;
        details = `${numPeople} jiwa × ${berasPerJiwa} kg/jiwa × ${formatCurrency(localRicePrice)}/kg = ${formatCurrency(amount)}\nBeras: ${numPeople * berasPerJiwa} kg`;
      }
    } else if (type === "MAAL") {
      const nisab = nisabGram * hargaEmas;
      const hartaBersih = totalHarta - totalHutang;
      if (hartaBersih >= nisab) {
        amount = (kadarZakat / 100) * hartaBersih;
        details = `Harta bersih ${formatCurrency(hartaBersih)} ≥ Nisab ${formatCurrency(nisab)}\n${kadarZakat}% × ${formatCurrency(hartaBersih)} = ${formatCurrency(amount)}`;
      } else {
        details = `Harta bersih ${formatCurrency(hartaBersih)} < Nisab ${formatCurrency(nisab)}\nAnda belum wajib membayar Zakat Maal.`;
      }
    } else {
      const nisab = nisabGram * hargaEmas;
      const gajiSetahun = gajiBulanan * 12;
      if (gajiSetahun >= nisab) {
        amount = (kadarZakat / 100) * gajiBulanan;
        details = `Penghasilan setahun ${formatCurrency(gajiSetahun)} ≥ Nisab ${formatCurrency(nisab)}\n${kadarZakat}% × ${formatCurrency(gajiBulanan)} = ${formatCurrency(amount)}/bulan`;
      } else {
        details = `Penghasilan setahun ${formatCurrency(gajiSetahun)} < Nisab ${formatCurrency(nisab)}\nAnda belum wajib membayar Zakat Penghasilan.`;
      }
    }

    setResult({ type, amount, details });
    setStep(3);
  };

  const typeOptions: { value: ZakatCalcType; label: string; desc: string; icon: string }[] = [
    { value: "FITRAH", label: "Zakat Fitrah", desc: "Wajib saat Ramadan, per jiwa", icon: "🌙" },
    { value: "MAAL", label: "Zakat Maal", desc: "2.5% dari harta di atas nisab", icon: "💰" },
    { value: "PENGHASILAN", label: "Zakat Penghasilan", desc: "2.5% dari gaji bulanan", icon: "💼" },
  ];

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              step >= s
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md"
                : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`w-12 h-1 rounded-full transition-all ${step > s ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">Pilih Jenis Zakat</h3>
          <div className="grid gap-3">
            {typeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setType(opt.value); setStep(2); }}
                className={`flex items-center  cursor-pointer gap-4 p-5 rounded-2xl border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                  type === opt.value
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-600"
                    : "border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 bg-white dark:bg-gray-800"
                }`}
              >
                <span className="text-3xl">{opt.icon}</span>
                <div>
                  <p className="font-bold text-gray-900 dark:text-gray-100">{opt.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Input Data */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {typeOptions.find((o) => o.value === type)?.icon} {typeOptions.find((o) => o.value === type)?.label}
            </h3>
            <button onClick={() => setStep(1)} className="cursor-pointer text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              ← Ubah Jenis
            </button>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              🔒 Data yang Anda masukkan hanya dihitung di browser. Tidak ada data keuangan yang dikirim ke server.
            </p>
          </div>

          {type === "FITRAH" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Calculator Mode Switch */}
              <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl border border-gray-200/30">
                <button
                  type="button"
                  onClick={() => { setFitrahMode("MANUAL"); setKkError(null); }}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    fitrahMode === "MANUAL"
                      ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  Hitung Manual
                </button>
                <button
                  type="button"
                  onClick={() => { setFitrahMode("KK"); setKkError(null); }}
                  className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    fitrahMode === "KK"
                      ? "bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  Cari Data KK
                </button>
              </div>

              {/* MANUAL MODE */}
              {fitrahMode === "MANUAL" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Jumlah Jiwa</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={numPeople}
                      onChange={(e) => setNumPeople(Number(e.target.value))}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-all font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Harga Beras per kg di Wilayah Anda (Rp)</label>
                    <input
                      type="number"
                      min={0}
                      value={localRicePrice || ""}
                      onChange={(e) => setLocalRicePrice(Number(e.target.value))}
                      placeholder={`Default: ${hargaBeras}`}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl">
                    <p>🧮 Takaran Syariah: <strong className="text-gray-700 dark:text-gray-300">{berasPerJiwa} kg</strong> beras per jiwa.</p>
                    <p>🌾 Total Beras Dibutuhkan: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{numPeople * berasPerJiwa} kg</strong></p>
                  </div>
                </div>
              )}

              {/* KK SEARCH LOOKUP MODE */}
              {fitrahMode === "KK" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Nomor Kartu Keluarga (16 Digit)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={16}
                        placeholder="Contoh: 320123XXXXXXXXXX"
                        value={kkInput}
                        onChange={(e) => setKkInput(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-all font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleLookupKK}
                        disabled={loadingKK || kkInput.length < 5}
                        className="px-5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs disabled:opacity-50"
                      >
                        {loadingKK ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Cari KK
                      </button>
                    </div>
                  </div>

                  {/* Errors */}
                  {kkError && (
                    <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-950 dark:bg-red-950/20 p-4 text-xs text-red-700 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{kkError}</span>
                    </div>
                  )}

                  {/* Lookup Result Success */}
                  {kkResult && (
                    <div className="space-y-4 border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-950/5 p-4 rounded-2xl animate-in zoom-in-95 duration-200">
                      {/* Family Head Metadata */}
                      <div className="grid grid-cols-2 gap-3 text-xs border-b dark:border-gray-700 pb-3">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">Kepala Keluarga</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">
                            {kkResult.members.find((m: any) => m.relationship === "KEPALA_KELUARGA")?.name || "Kepala Keluarga"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">Cakupan Masjid</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                            {kkResult.mosqueName}
                          </span>
                        </div>
                      </div>

                      {/* Member Selection Checklist */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Pilih Anggota Keluarga yang Membayar Zakat ({selectedKKMembers.length} Terpilih):</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar p-1">
                          {kkResult.members.map((member: any) => {
                            const isChecked = selectedKKMembers.includes(member.id);
                            return (
                              <label
                                key={member.id}
                                className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer border text-xs transition-all ${
                                  isChecked
                                    ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/50 font-bold"
                                    : "bg-white dark:bg-gray-800 border-gray-150 dark:border-gray-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSelectedKKMembers(selectedKKMembers.filter(id => id !== member.id));
                                    } else {
                                      setSelectedKKMembers([...selectedKKMembers, member.id]);
                                    }
                                  }}
                                  className="w-3.5 h-3.5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                />
                                <span className="truncate flex-1 text-gray-700 dark:text-gray-300">{member.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Local Rice Price Multiplier */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-gray-400 uppercase font-bold">Harga Beras per kg di Lokasi Anda (Rp)</label>
                        <input
                          type="number"
                          min={0}
                          value={localRicePrice || ""}
                          onChange={(e) => setLocalRicePrice(Number(e.target.value))}
                          placeholder={`Default: ${hargaBeras}`}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs focus:border-emerald-500 focus:outline-none transition-all font-mono"
                        />
                      </div>

                      {/* Live Total Indicators */}
                      {selectedKKMembers.length > 0 && (
                        <div className="flex justify-between items-center bg-white dark:bg-gray-800/80 p-3 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30">
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Estimasi Zakat ({selectedKKMembers.length} Jiwa)</span>
                          <div className="text-right">
                            <div className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(selectedKKMembers.length * berasPerJiwa * localRicePrice)}
                            </div>
                            <div className="text-[9px] text-gray-400">
                              Atau Beras: {selectedKKMembers.length * berasPerJiwa} kg
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {type === "MAAL" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Harta (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={totalHarta || ""}
                  onChange={(e) => setTotalHarta(Number(e.target.value))}
                  placeholder="Contoh: 100000000"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Hutang (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={totalHutang || ""}
                  onChange={(e) => setTotalHutang(Number(e.target.value))}
                  placeholder="Contoh: 5000000"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Harga emas: <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(hargaEmas)}/gram</strong></p>
                <p>Nisab: <strong className="text-gray-700 dark:text-gray-300">{nisabGram}g × {formatCurrency(hargaEmas)} = {formatCurrency(nisabGram * hargaEmas)}</strong></p>
              </div>
            </div>
          )}

          {type === "PENGHASILAN" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Gaji Bulanan (Rp)</label>
                <input
                  type="number"
                  min={0}
                  value={gajiBulanan || ""}
                  onChange={(e) => setGajiBulanan(Number(e.target.value))}
                  placeholder="Contoh: 10000000"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Nisab setahun: <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(nisabGram * hargaEmas)}</strong></p>
              </div>
            </div>
          )}

          <button
            onClick={calculate}
            disabled={type === "FITRAH" && fitrahMode === "KK" && (!kkResult || selectedKKMembers.length === 0)}
            className="w-full py-3.5 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hitung Zakat
          </button>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && result && (
        <div className="space-y-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center">Hasil Perhitungan</h3>

          <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
              {typeOptions.find((o) => o.value === result.type)?.label}
            </p>
            {result.amount > 0 ? (
              <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300">
                {formatCurrency(result.amount)}
              </p>
            ) : (
              <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">Belum Wajib</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{result.details}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setStep(1); setResult(null); }}
              className="flex-1 py-3 cursor-pointer border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Hitung Ulang
            </button>
            {result.amount > 0 && (
              <button
                onClick={() => onPayNow(result.amount, result.type)}
                className="flex-1 py-3  cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                Bayar Sekarang →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
