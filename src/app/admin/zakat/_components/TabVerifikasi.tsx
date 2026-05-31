"use client";

import { useEffect, useState } from "react";
import { zakatService, ZakatPayment } from "@/services/zakat.service";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  ImageIcon,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function TabVerifikasi() {
  const [payments, setPayments] = useState<ZakatPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const [modal, setModal] = useState<{
    type: "approve" | "reject" | "preview";
    payment: ZakatPayment;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await zakatService.getPendingPayments(1, 100); // 100 for simplicity in MVP
      setPayments(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const handleApprove = async () => {
    if (!modal) return;
    setProcessing(modal.payment.id);
    try {
      await zakatService.approvePayment(modal.payment.id);
      setModal(null);
      loadPayments();
    } catch (err) {
      toast.error("Gagal menyetujui");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!modal || !rejectReason.trim()) return;
    setProcessing(modal.payment.id);
    try {
      await zakatService.rejectPayment(modal.payment.id, rejectReason);
      setModal(null);
      loadPayments();
    } catch (err) {
      toast.error("Gagal menolak");
    } finally {
      setProcessing(null);
    }
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "");

  if (loading) {
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
          Pembayaran Menunggu Verifikasi
        </h2>
        <Button onClick={loadPayments} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {payments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            Semua pembayaran sudah diverifikasi.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Tipe Zakat</th>
                <th className="px-4 py-3 font-semibold">Muzakki</th>
                <th className="px-4 py-3 font-semibold text-right">Nominal</th>
                <th className="px-4 py-3 font-semibold">Tanggal</th>
                <th className="px-4 py-3 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      {p.zakat_type}
                    </span>
                    <br />
                    <span className="text-xs text-gray-500">
                      {p.period?.title}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                    {p.payer_name}
                    {p.zakat_type === "FITRAH" && p.num_people && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({p.num_people} jiwa)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {new Date(p.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setModal({ type: "preview", payment: p })
                        }
                      >
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          setModal({ type: "approve", payment: p })
                        }
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setModal({ type: "reject", payment: p });
                          setRejectReason("");
                        }}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {modal?.type === "preview" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">
                Bukti Transfer - {modal.payment.payer_name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setModal(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex justify-center bg-gray-100 dark:bg-gray-900 rounded-lg p-2 max-h-[70vh] overflow-auto">
              <img
                src={`${apiBase}/uploads/${modal.payment.bukti_transfer}`}
                alt="Bukti"
                className="object-contain max-h-[60vh] rounded"
              />
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <Button
                onClick={() =>
                  setModal({ type: "approve", payment: modal.payment })
                }
                className="bg-emerald-600"
              >
                Setujui
              </Button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === "approve" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 text-center space-y-4">
            <h3 className="text-xl font-bold">Setujui Pembayaran?</h3>
            <p className="text-gray-500">
              Menerima pembayaran sebesar{" "}
              <strong>{formatCurrency(modal.payment.amount)}</strong> dari{" "}
              {modal.payment.payer_name}.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setModal(null)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-emerald-600"
                onClick={handleApprove}
                disabled={!!processing}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Ya, Setujui"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {modal?.type === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold text-red-600 border-b pb-2">
              Tolak Pembayaran
            </h3>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Alasan Penolakan
              </label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukti buram"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setModal(null)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleReject}
                disabled={!!processing || !rejectReason.trim()}
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Tolak"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
