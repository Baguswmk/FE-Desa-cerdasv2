"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Search,
  RefreshCw,
  ShieldOff,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { adminService } from "@/services/admin.service";
import { useAuth } from "@/hooks/useAuth";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import AdminNavbar from "@/components/AdminNavbar";
import { toast } from "sonner";

interface User {
  id: string;
  nama: string;
  email: string;
  no_hp: string | null;
  role: string;
  status: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "BANNED">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Actions
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ userId: string; action: "ACTIVE" | "BANNED"; name: string } | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ userId: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    no_hp: "",
    role: "WARGA",
    status: "ACTIVE"
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (user) loadUsers();
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getAllUsers();
      setUsers(res.data ?? res);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, newStatus: "ACTIVE" | "BANNED") => {
    setUpdatingId(userId);
    try {
      await adminService.updateUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
      );
      toast.success(`Status pengguna berhasil diubah ke ${newStatus === "ACTIVE" ? "Aktif" : "Diblokir"}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal mengubah status pengguna");
    } finally {
      setUpdatingId(null);
      setConfirmModal(null);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({ nama: "", email: "", password: "", no_hp: "", role: "WARGA", status: "ACTIVE" });
    setShowFormModal(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormData({
      nama: u.nama,
      email: u.email,
      password: "", // empty for edit unless they want to change it
      no_hp: u.no_hp || "",
      role: u.role,
      status: u.status
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      if (editingUser) {
        // Only send password if it was entered
        const dataToSubmit = { ...formData };
        if (!dataToSubmit.password) {
          delete (dataToSubmit as any).password;
        }
        await adminService.updateUser(editingUser.id, dataToSubmit);
        toast.success("Data pengguna berhasil diperbarui");
      } else {
        await adminService.createUser(formData);
        toast.success("Pengguna baru berhasil ditambahkan");
      }
      setShowFormModal(false);
      loadUsers(); // refresh data
    } catch(err: any) {
      toast.error(err?.response?.data?.message || "Gagal menyimpan data pengguna");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteModal.userId);
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.userId));
      toast.success(`Pengguna "${deleteModal.name}" berhasil dihapus`);
      setDeleteModal(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Gagal menghapus pengguna");
    } finally {
      setDeleting(false);
    }
  };

  if (!user) return <LoadingScreen message="Memuat halaman..." />;

  // Filter logic
  const filtered = users.filter((u) => {
    const matchSearch =
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.no_hp ?? "").includes(search);
    const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedUsers = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/20 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-200/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-pulse-slow animation-delay-1000"></div>
      </div>

      <AdminNavbar />

      {/* Main */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-700 to-purple-700 bg-clip-text text-transparent">
              Manajemen Pengguna
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Terdapat total {users.length} akun terdaftar di sistem</p>
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Button onClick={handleOpenAdd} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-md transform hover:-translate-y-0.5 transition-all">
              <Plus className="w-4 h-4 mr-2" />Tambah Pengguna
            </Button>
            <Button onClick={loadUsers} variant="outline" className="border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 text-violet-700 font-semibold shadow-sm">
              <RefreshCw className="w-4 h-4 mr-2" />Refresh Data
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <Card className="border-2 border-violet-100 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Cari berdasarkan nama, email, atau no. HP..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // Reset page on search
                  }}
                  className="pl-9 border-2 border-violet-100 focus:border-violet-400 rounded-xl"
                />
              </div>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                {(["ALL", "ACTIVE", "BANNED"] as const).map((s) => (
                  <Button
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setCurrentPage(1); // Reset page on filter
                    }}
                    variant={statusFilter === s ? "default" : "outline"}
                    className={`font-semibold text-sm flex-1 sm:flex-none rounded-xl ${
                      statusFilter === s 
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md transform hover:-translate-y-0.5" 
                      : "border-2 border-violet-100 hover:border-violet-300 text-gray-700"
                    }`}
                  >
                    {s === "ALL" ? "Semua" : s === "ACTIVE" ? "🟢 Aktif" : "🔴 Diblokir"}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
            <p className="text-gray-500 font-semibold">Memuat data pengguna...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center shadow-inner">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-700 font-semibold">{error}</p>
            <Button onClick={loadUsers} variant="outline" className="border-2 border-violet-200 hover:border-violet-400 text-violet-700">
              <RefreshCw className="w-4 h-4 mr-2" />Coba Lagi
            </Button>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <Card className="border-2 border-violet-100 shadow-xl overflow-hidden mb-6">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b-2 border-violet-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-violet-600" />
                    Daftar Pengguna
                  </CardTitle>
                  <CardDescription>
                    Menampilkan {paginatedUsers.length} dari {filtered.length} pengguna
                  </CardDescription>
                </div>
                {/* Summary badges */}
                <div className="hidden sm:flex items-center gap-2">
                  <Badge className="bg-emerald-100/80 text-emerald-800 border-2 border-emerald-200 font-semibold px-3 py-1 text-xs">
                    <UserCheck className="w-3.5 h-3.5 mr-1" />
                    {users.filter(u => u.status === "ACTIVE").length} Aktif
                  </Badge>
                  <Badge className="bg-red-100/80 text-red-800 border-2 border-red-200 font-semibold px-3 py-1 text-xs">
                    <UserX className="w-3.5 h-3.5 mr-1" />
                    {users.filter(u => u.status === "BANNED").length} Diblokir
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 bg-gray-50/50">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mb-2">
                    <Search className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-gray-600 font-bold text-lg">Tidak ada pengguna ditemukan</p>
                  <p className="text-gray-400 text-sm">Coba ubah kata kunci pencarian atau filter status.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white border-b-2 border-violet-100">
                        <th className="text-left px-5 py-4 font-black text-gray-600 uppercase tracking-widest text-xs">Pengguna</th>
                        <th className="text-left px-5 py-4 font-black text-gray-600 uppercase tracking-widest text-xs">Kontak</th>
                        <th className="text-left px-5 py-4 font-black text-gray-600 uppercase tracking-widest text-xs">Role / Status</th>
                        <th className="text-left px-5 py-4 font-black text-gray-600 uppercase tracking-widest text-xs">Bergabung</th>
                        <th className="text-center px-5 py-4 font-black text-gray-600 uppercase tracking-widest text-xs w-[140px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {paginatedUsers.map((u) => (
                        <tr key={u.id} className={`hover:bg-violet-50/50 transition-colors group ${u.status === "BANNED" ? "bg-red-50/10" : ""}`}>
                          {/* Nama */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-sm shrink-0 ${u.status === "BANNED" ? "bg-gradient-to-br from-red-400 to-rose-500" : "bg-gradient-to-br from-violet-500 to-purple-600"}`}>
                                {u.nama[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900">{u.nama}</p>
                                {/* <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {u.id.substring(0,8)}...</p> */}
                              </div>
                            </div>
                          </td>

                          {/* Kontak */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Mail className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                <span className="font-medium">{u.email}</span>
                              </div>
                              {u.no_hp && (
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Phone className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                                  <span className="font-medium">{u.no_hp}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Role & Status */}
                          <td className="px-5 py-4 space-y-2">
                            <div>
                               <Badge className={`text-[10px] font-black tracking-wider uppercase ${u.role === "admin" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-blue-100 text-blue-800 border-blue-300"}`}>
                                {u.role}
                              </Badge>
                            </div>
                            <div>
                              <Badge className={`text-xs font-bold ${u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : "bg-red-100 text-red-800 border border-red-300"}`}>
                                {u.status === "ACTIVE" ? "🟢 Aktif" : "🔴 Diblokir"}
                              </Badge>
                            </div>
                          </td>

                          {/* Tanggal */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs font-medium">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              <span>{formatDate(u.created_at)}</span>
                            </div>
                          </td>

                          {/* Aksi */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-2">
                              {u.role !== "admin" ? (
                                <Button
                                  size="sm"
                                  onClick={() => setConfirmModal({ userId: u.id, action: u.status === "ACTIVE" ? "BANNED" : "ACTIVE", name: u.nama })}
                                  disabled={updatingId === u.id}
                                  className={`w-full font-bold text-xs shadow-sm transition-all ${
                                    u.status === "ACTIVE"
                                    ? "bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 hover:border-red-400"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400"
                                  }`}
                                  variant="outline"
                                >
                                  {updatingId === u.id ? (
                                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                                  ) : u.status === "ACTIVE" ? (
                                    <ShieldOff className="w-3.5 h-3.5 mr-1.5" />
                                  ) : (
                                    <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                                  )}
                                  {updatingId === u.id ? "Proses..." : u.status === "ACTIVE" ? "Blokir" : "Aktifkan"}
                                </Button>
                              ) : (
                                <div className="text-center w-full">
                                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full block">System Admin</span>
                                </div>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEdit(u)}
                                className="w-full font-bold text-xs shadow-sm border-2 border-gray-200 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-700 text-gray-600 transition-all"
                              >
                                <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                              </Button>
                              {u.role !== "admin" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setDeleteModal({ userId: u.id, name: u.nama })}
                                  className="w-full font-bold text-xs shadow-sm border-2 border-red-100 hover:border-red-400 hover:bg-red-50 hover:text-red-700 text-red-500 transition-all"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Hapus
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="border-t-2 border-violet-100 bg-gray-50/50 p-4 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">
                    Menampilkan <span className="text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="text-gray-900">{Math.min(currentPage * itemsPerPage, filtered.length)}</span> dari <span className="text-gray-900">{filtered.length}</span> data
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-2 font-bold"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Prev
                    </Button>
                    <div className="flex items-center justify-center min-w-[32px] font-black text-sm text-violet-700 bg-violet-100 rounded-md">
                      {currentPage}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-2 font-bold"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-100 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className={`p-6 border-b-2 rounded-t-2xl ${confirmModal.action === "BANNED" ? "border-red-100 bg-red-50/50" : "border-emerald-100 bg-emerald-50/50"}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${confirmModal.action === "BANNED" ? "bg-red-100" : "bg-emerald-100"}`}>
                  {confirmModal.action === "BANNED"
                    ? <ShieldOff className="w-7 h-7 text-red-600" />
                    : <ShieldCheck className="w-7 h-7 text-emerald-600" />}
                </div>
                <div>
                  <h3 className={`text-xl font-black mb-1 ${confirmModal.action === "BANNED" ? "text-red-800" : "text-emerald-800"}`}>
                    {confirmModal.action === "BANNED" ? "Blokir Akses Akun?" : "Aktifkan Akses Akun?"}
                  </h3>
                  <p className="text-sm font-bold text-gray-900">
                    {confirmModal.name}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className={`p-4 rounded-xl border-l-4 mb-6 ${confirmModal.action === "BANNED" ? "bg-red-50 border-red-400 text-red-900" : "bg-emerald-50 border-emerald-400 text-emerald-900"}`}>
                <p className="text-sm font-medium leading-relaxed">
                  {confirmModal.action === "BANNED"
                    ? `Akun ini akan diblokir dari sistem. Pengguna tidak akan bisa melakukan login atau mengakses fitur desa. Tindakan ini bisa dibatalkan nanti.`
                    : `Akun ini akan diaktifkan kembali. Pengguna akan bisa melakukan login dan menggunakan layanan sistem seperti biasa.`}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setConfirmModal(null)}
                  variant="outline"
                  className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-6 text-base shadow-sm"
                >
                  Batalkan
                </Button>
                <Button
                  onClick={() => handleToggleStatus(confirmModal.userId, confirmModal.action)}
                  disabled={!!updatingId}
                  className={`flex-1 font-black py-6 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all ${
                    confirmModal.action === "BANNED"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  }`}
                >
                  {updatingId ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {confirmModal.action === "BANNED" ? "Ya, Blokir Cepat" : "Ya, Aktifkan Penuh"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !deleting && setDeleteModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-red-100 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b-2 border-red-100 bg-red-50/50 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner bg-red-100">
                  <Trash2 className="w-7 h-7 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black mb-1 text-red-800">Hapus Pengguna?</h3>
                  <p className="text-sm font-bold text-gray-900">{deleteModal.name}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="p-4 rounded-xl border-l-4 mb-6 bg-red-50 border-red-400 text-red-900">
                <p className="text-sm font-medium leading-relaxed">
                  Akun pengguna ini akan dihapus secara permanen dari sistem. Tindakan ini <strong>tidak bisa dibatalkan</strong>.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setDeleteModal(null)}
                  variant="outline"
                  disabled={deleting}
                  className="flex-1 border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-6 text-base shadow-sm"
                >
                  Batalkan
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 font-black py-6 text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                >
                  {deleting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Trash2 className="w-5 h-5 mr-2" />}
                  Ya, Hapus Permanen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !formSubmitting && setShowFormModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-violet-100 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b-2 border-violet-100 bg-gradient-to-r from-violet-50 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  {editingUser ? <Edit className="w-5 h-5 text-violet-600" /> : <Plus className="w-5 h-5 text-violet-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">
                    {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">Isi formulir di bawah dengan lengkap</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowFormModal(false)} disabled={formSubmitting} className="rounded-xl hover:bg-red-50 hover:text-red-500">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nama Lengkap</label>
                <Input required value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} className="border-2 border-violet-100 focus:border-violet-500 transition-all rounded-xl" placeholder="Ahmad Budi..." />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <Input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="border-2 border-violet-100 focus:border-violet-500 transition-all rounded-xl" placeholder="budi@example.com" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Password</label>
                <Input required={!editingUser} type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="border-2 border-violet-100 focus:border-violet-500 transition-all rounded-xl" placeholder={editingUser ? "Kosongkan jika tidak mengubah password" : "Minimal 6 karakter"} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">Nomor HP</label>
                <Input value={formData.no_hp} onChange={(e) => setFormData({...formData, no_hp: e.target.value})} className="border-2 border-violet-100 focus:border-violet-500 transition-all rounded-xl" placeholder="081234567890" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Role</label>
                  <select 
                    value={formData.role} 
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-xl border-2 border-violet-100 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-medium text-gray-700"
                  >
                    <option value="WARGA">Warga</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-gray-700">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="flex h-10 w-full items-center justify-between rounded-xl border-2 border-violet-100 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent font-medium text-gray-700"
                  >
                    <option value="ACTIVE">Aktif</option>
                    <option value="BANNED">Diblokir</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-3">
                <Button type="button" onClick={() => setShowFormModal(false)} variant="outline" className="flex-1 font-bold border-2 rounded-xl h-11" disabled={formSubmitting}>Batal</Button>
                <Button type="submit" disabled={formSubmitting} className="flex-1 font-black bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md rounded-xl h-11">
                  {formSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {editingUser ? "Simpan Perubahan" : "Simpan Pengguna"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
