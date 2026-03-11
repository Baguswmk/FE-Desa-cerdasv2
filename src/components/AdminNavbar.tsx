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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/kegiatan", label: "Kelola Kegiatan", icon: ClipboardList },
  { href: "/admin/donasi", label: "Donasi Masuk", icon: Heart },
  { href: "/admin/users", label: "Kelola User", icon: UserCog },
  { href: "/kegiatan", label: "Website", icon: Eye },
];

export default function AdminNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <nav className="relative z-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b-2 border-emerald-100 dark:border-emerald-900 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-18">
          {/* Logo */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-300 transition-shadow">
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

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`relative font-semibold text-sm px-3 group cursor-pointer border-0 ${
                      active
                        ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    {link.label}
                    <span
                      className={`absolute -bottom-[1px] left-0 h-0.5 bg-emerald-600 transition-all rounded-full ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
            <ThemeToggle />
            {user && (
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{user.nama}</p>
                <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold">
                  ADMIN
                </Badge>
              </div>
            )}
            <Button
              onClick={() => logout()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden xl:inline">Keluar</span>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hidden sm:flex">
              ADMIN
            </Badge>
            <Button
              variant="outline"
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl border-2 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-200 transition-all font-bold w-10 h-10"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 dark:bg-gray-900/95 border-t border-emerald-100 dark:border-gray-800 px-4 py-4 space-y-1">
          {user && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 rounded-xl mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-black">
                {user.nama?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{user.nama}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
                {active && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-emerald-100">
            <Button
              onClick={() => { logout(); setOpen(false); }}
              className="w-full cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-semibold hover:bg-red-50 transition-all"
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
