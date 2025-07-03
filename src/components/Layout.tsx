"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Archive,
  List,
  ArrowUp,
  ArrowDown,
  Calendar,
  Menu,
  X,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const lowStockCount = 0;
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: Home,
      color: "from-violet-500 via-purple-500 to-fuchsia-500",
      description: "Ringkasan inventory",
    },
    {
      name: "Barang",
      path: "/items",
      icon: Archive,
      color: "from-emerald-400 via-teal-500 to-cyan-500",
      description: "Kelola barang",
    },
    {
      name: "Kategori",
      path: "/categories",
      icon: List,
      color: "from-orange-400 via-red-500 to-pink-500",
      description: "Atur kategori",
    },
    {
      name: "Barang Masuk",
      path: "/stock-in",
      icon: ArrowUp,
      color: "from-green-400 via-emerald-500 to-teal-500",
      description: "Input stok masuk",
    },
    {
      name: "Barang Keluar",
      path: "/stock-out",
      icon: ArrowDown,
      color: "from-red-400 via-pink-500 to-rose-500",
      description: "Input stok keluar",
    },
    {
      name: "Histori",
      path: "/history",
      icon: Calendar,
      color: "from-indigo-400 via-purple-500 to-violet-500",
      description: "Riwayat transaksi",
    },
  ];

  React.useEffect(() => {
    // SEO optimization - update document title based on current route
    const currentItem = navigationItems.find((item) => item.path === pathname);
    const pageTitle = currentItem
      ? `${currentItem.name} - InventoryApp`
      : "InventoryApp - Manajemen Stok Modern";
    document.title = pageTitle;
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80 text-foreground transition-all duration-500 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-pink-400/10 to-violet-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-white/70 backdrop-blur-xl border-r border-slate-200/50 shadow-2xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full relative">
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 lg:hidden z-10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Header */}
          <div className="p-6 border-b border-slate-200/50 relative">
            <div className="flex items-center space-x-3">
              <div className="min-w-0 flex-1 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight leading-tight whitespace-normal break-words">
                    InventoryApp
                  </h1>
                  <p className="text-xs text-muted-foreground font-medium mt-1 whitespace-normal break-words">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      Manajemen Stok Premium
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 space-y-1">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`group relative flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 animate-fade-in text-sm ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-purple-500/20 scale-105`
                      : "text-muted-foreground hover:bg-white/60 hover:text-foreground hover:shadow"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div
                    className={`relative p-1 rounded-lg ${
                      isActive
                        ? "bg-white/20"
                        : "bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-violet-100 group-hover:to-purple-100"
                    } transition-all duration-300`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-all duration-300 ${
                        isActive
                          ? "text-white animate-pulse"
                          : "group-hover:scale-110 group-hover:text-violet-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-xs truncate">
                      {item.name}
                    </span>
                    <p
                      className={`text-[10px] mt-0.5 truncate ${
                        isActive ? "text-white/80" : "text-muted-foreground"
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                  {item.name === "Barang" && lowStockCount > 0 && (
                    <div className="relative">
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-bounce shadow font-bold">
                        {lowStockCount}
                      </span>
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                    </div>
                  )}
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 left-4 z-40 lg:hidden bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-lg"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Main Content */}
      <div className="lg:ml-72 relative z-10">
        <main className="p-4 lg:p-12">
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
