"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, User, LogOut, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authService } from "@/services/auth.service";

interface NavbarProps {
  currentPage?: "kegiatan" | "smartfarm" | "tanya-hukum" | "tentang";
}

export default function Navbar({ currentPage = "kegiatan" }: NavbarProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    const storedUser = authService.getStoredUser();
    setIsAuthenticated(authenticated);
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const getDashboardUrl = () => {
    return authService.getDashboardUrl();
  };

  const isCurrentPage = (page: string) => page === currentPage;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-emerald-100 shadow-sm animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                <Home className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white shadow-md"></div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
              Desa Cerdas
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/kegiatan"
              className={`${isCurrentPage("kegiatan") ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-emerald-600 font-semibold"} transition-colors duration-200 relative group`}
            >
              Kegiatan
              <span
                className={`absolute -bottom-1 left-0 ${isCurrentPage("kegiatan") ? "w-full" : "w-0"} h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full`}
              ></span>
            </Link>
            <Link
              href="/smartfarm"
              className={`${isCurrentPage("smartfarm") ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-emerald-600 font-semibold"} transition-colors duration-200 relative group`}
            >
              Smart Farm
              <span
                className={`absolute -bottom-1 left-0 ${isCurrentPage("smartfarm") ? "w-full" : "w-0"} h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full`}
              ></span>
            </Link>
            <Link
              href="/tanya-hukum"
              className={`${isCurrentPage("tanya-hukum") ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-emerald-600 font-semibold"} transition-colors duration-200 relative group`}
            >
              Tanya Hukum
              <span
                className={`absolute -bottom-1 left-0 ${isCurrentPage("tanya-hukum") ? "w-full" : "w-0"} h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full`}
              ></span>
            </Link>
            <Link
              href="/tentang"
              className={`${isCurrentPage("tentang") ? "text-emerald-700 font-bold" : "text-gray-700 hover:text-emerald-600 font-semibold"} transition-colors duration-200 relative group`}
            >
              Tentang
              <span
                className={`absolute -bottom-1 left-0 ${isCurrentPage("tentang") ? "w-full" : "w-0"} h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full`}
              ></span>
            </Link>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 rounded-full w-12 h-12 p-0"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {user.nama}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push(getDashboardUrl())}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                  Masuk
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
