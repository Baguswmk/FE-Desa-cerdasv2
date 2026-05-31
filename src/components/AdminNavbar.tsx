"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Heart,
  ClipboardList,
  Eye,
  LogOut,
  Menu,
  X,
  UserCog,
  LayoutDashboard,
  Coins,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";

const programLinks = [
  { href: "/admin/kegiatan", label: "Kelola Kegiatan", icon: ClipboardList },
  { href: "/admin/donasi", label: "Donasi Masuk", icon: Heart },
  { href: "/admin/zakat", label: "Zakat & Sedekah", icon: Coins },
];

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [layananOpen, setLayananOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  const isLayananActive = programLinks.some(link => isActive(link.href));

  return (
    <nav className="relative z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b-2 border-emerald-100 dark:border-emerald-900 sticky top-0 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-300 transition-all">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <span className="text-base font-black bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block leading-tight">Desa Cerdas</p>
            </div>
          </Link>

          {/* Desktop Links with Dropdown */}
          <div className="hidden lg:flex items-center gap-1.5">
            {/* Dashboard */}
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                className={`relative font-bold text-sm px-3.5 py-2 group cursor-pointer border-0 rounded-xl transition-all ${
                  isActive("/admin/dashboard")
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                }`}
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Dashboard
              </Button>
            </Link>

            {/* Layanan & Program Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setLayananOpen(true)}
              onMouseLeave={() => setLayananOpen(false)}
            >
              <Button
                variant="ghost"
                className={`relative font-bold text-sm px-3.5 py-2 flex items-center gap-1 border-0 rounded-xl cursor-pointer transition-all ${
                  isLayananActive
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                }`}
              >
                <ClipboardList className="w-4 h-4 mr-1.5" />
                Layanan & Program
                <ChevronDown className={`w-3.5 h-3.5 ml-0.5 transition-transform duration-200 ${layananOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Dropdown Menu Card */}
              {layananOpen && (
                <div className="absolute left-0 mt-0 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2.5 z-50 transform origin-top animate-in fade-in slide-in-from-top-2 duration-150">
                  {programLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.href);
                    return (
                      <Link key={link.href} href={link.href} className="block px-2 py-0.5">
                        <button
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all cursor-pointer border-0 bg-transparent ${
                            active
                              ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/20"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 hover:text-emerald-700 dark:hover:text-emerald-400"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`} />
                          {link.label}
                        </button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Kelola User */}
            <Link href="/admin/users">
              <Button
                variant="ghost"
                className={`relative font-bold text-sm px-3.5 py-2 group cursor-pointer border-0 rounded-xl transition-all ${
                  isActive("/admin/users")
                    ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                    : "text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                }`}
              >
                <UserCog className="w-4 h-4 mr-1.5" />
                Kelola User
              </Button>
            </Link>

            {/* Website Link */}
            <Link href="/kegiatan">
              <Button
                variant="ghost"
                className="relative font-bold text-sm px-3.5 py-2 group cursor-pointer border-0 rounded-xl text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
              >
                <Eye className="w-4 h-4 mr-1.5" />
                Lihat Web
              </Button>
            </Link>
          </div>

          {/* Desktop Right Panel */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
            <ThemeToggle />
            {user && (
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.nama}</p>
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold py-0 px-2 mt-0.5 border-0">
                  ADMIN
                </Badge>
              </div>
            )}
            <Button
              onClick={() => logout()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all border-0 rounded-xl"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden xl:inline">Keluar</span>
            </Button>
          </div>

          {/* Mobile Hamburgers */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold py-0.5 px-2 border-0 hidden sm:flex">
              ADMIN
            </Badge>
            <Button
              variant="outline"
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl border-2 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-200 transition-all font-bold w-10 h-10 flex items-center justify-center cursor-pointer"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Clean Responsive Design) */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 border-t border-emerald-100 dark:border-gray-800 px-4 py-4 space-y-1 backdrop-blur-md">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl mb-3 border border-emerald-100/50 dark:border-emerald-900/30">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-black">
                {user.nama?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.nama}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
              </div>
            </div>
          )}

          {/* Mobile Main Dashboard Link */}
          <Link
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              isActive("/admin/dashboard")
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-700"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Subheading Layanan & Program */}
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-400 px-4 pt-3 pb-1 border-t border-gray-100 dark:border-gray-800 mt-2">
            Layanan & Program
          </div>
          {programLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold transition-all ${
                  active
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-700 dark:hover:text-emerald-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}

          {/* Mobile Bottom Section */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-2 mt-2 space-y-1">
            <Link
              href="/admin/users"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                isActive("/admin/users")
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-700"
              }`}
            >
              <UserCog className="w-4 h-4" />
              Kelola User
            </Link>
            <Link
              href="/kegiatan"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 hover:text-emerald-700"
            >
              <Eye className="w-4 h-4" />
              Lihat Web
            </Link>
          </div>

          {/* Mobile Sign Out */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
            <Button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 border-0 bg-transparent"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
