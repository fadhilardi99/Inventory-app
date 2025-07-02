"use client";
import React from "react";
// import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Zap,
  Activity,
  Package,
  BarChart3,
} from "lucide-react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { useItemsQuery } from "@/hooks/useItems";
import { useCategoriesQuery } from "@/hooks/useCategories";

const Dashboard = () => {
  // const { state, getLowStockItems, getCategoryName } = useInventory();
  // const lowStockItems = getLowStockItems();

  // Fetch real data using React Query
  const { data: items = [], isLoading: isLoadingItems } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const { data: stockInTransactions = [], isLoading: isLoadingStockIn } =
    useQuery({
      queryKey: ["stock-in"],
      queryFn: async () => {
        const res = await fetch("/api/stock-in");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      },
    });

  const { data: stockOutTransactions = [], isLoading: isLoadingStockOut } =
    useQuery({
      queryKey: ["stock-out"],
      queryFn: async () => {
        const res = await fetch("/api/stock-out");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      },
    });

  // Calculate remaining stock for each item based on transaction history
  const calculateRemainingStock = (itemId: string) => {
    const item = items.find((i: Record<string, unknown>) => i.id === itemId);
    if (!item) return 0;

    const baseStock = item.stock as number;

    const stockInTotal = stockInTransactions
      .filter((t: Record<string, unknown>) => t.itemId === itemId)
      .reduce(
        (sum: number, t: Record<string, unknown>) =>
          sum + (t.quantity as number),
        0
      );

    const stockOutTotal = stockOutTransactions
      .filter((t: Record<string, unknown>) => t.itemId === itemId)
      .reduce(
        (sum: number, t: Record<string, unknown>) =>
          sum + (t.quantity as number),
        0
      );

    return baseStock + stockInTotal - stockOutTotal;
  };

  // Calculate real statistics
  const totalItems = items.length;
  const totalCategories = categories.length;
  const totalStockIn = stockInTransactions.reduce(
    (sum: number, t: Record<string, unknown>) => sum + (t.quantity as number),
    0
  );
  const totalStockOut = stockOutTransactions.reduce(
    (sum: number, t: Record<string, unknown>) => sum + (t.quantity as number),
    0
  );

  // Get low stock items (stock <= minStock)
  const lowStockItems = items.filter(
    (item: Record<string, unknown>) =>
      (item.stock as number) <= (item.minStock as number)
  );

  // Get recent transactions (combine stock-in and stock-out)
  const allTransactions = [
    ...stockInTransactions.map((t: Record<string, unknown>) => ({
      ...t,
      type: "in",
    })),
    ...stockOutTransactions.map((t: Record<string, unknown>) => ({
      ...t,
      type: "out",
    })),
  ]
    .sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime()
    )
    .slice(0, 5);

  // Get top items by remaining stock
  const topItems = [...items]
    .map((item: Record<string, unknown>) => ({
      ...item,
      remainingStock: calculateRemainingStock(item.id as string),
    }))
    .sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (b.remainingStock as number) - (a.remainingStock as number)
    )
    .slice(0, 5);

  const isLoading = isLoadingItems || isLoadingStockIn || isLoadingStockOut;

  const statsCards = [
    {
      title: "Total Barang",
      value: totalItems,
      subtitle: `${totalCategories} kategori aktif`,
      icon: Package,
      gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
      bgGradient:
        "from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20",
      iconBg:
        "from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30",
      trend: totalItems > 0 ? "+12%" : "0%",
      description: "Total item inventory",
    },
    {
      title: "Barang Masuk",
      value: totalStockIn,
      subtitle: "Unit masuk bulan ini",
      icon: ArrowUp,
      gradient: "from-emerald-400 via-teal-500 to-cyan-500",
      bgGradient:
        "from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      iconBg:
        "from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30",
      trend: totalStockIn > 0 ? "+8%" : "0%",
      description: "Peningkatan stok",
    },
    {
      title: "Barang Keluar",
      value: totalStockOut,
      subtitle: "Unit keluar bulan ini",
      icon: ArrowDown,
      gradient: "from-red-400 via-pink-500 to-rose-500",
      bgGradient:
        "from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
      iconBg:
        "from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-100 dark:from-red-900/30 dark:to-pink-900/30",
      trend: totalStockOut > 0 ? "-5%" : "0%",
      description: "Distribusi barang",
    },
    {
      title: "Stok Rendah",
      value: lowStockItems.length,
      subtitle: "Perlu segera diisi ulang",
      icon: Zap,
      gradient: "from-yellow-400 via-orange-500 to-red-500",
      bgGradient:
        "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
      iconBg:
        "from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30",
      trend: lowStockItems.length > 0 ? "⚠️" : "✅",
      description: "Alert stok minimum",
    },
  ];

  if (isLoading) {
    return (
      <SignedIn>
        <div className="space-y-10 animate-fade-in">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat dashboard...</p>
          </div>
        </div>
      </SignedIn>
    );
  }

  return (
    <>
      <SignedIn>
        <div className="space-y-10 animate-fade-in">
          {/* Hero Header */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-fuchsia-600/10 blur-3xl"></div>
            <div className="relative text-center space-y-6 py-12">
              <div className="inline-flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full border border-violet-200/50 dark:border-violet-700/50">
                <Activity className="w-5 h-5 text-violet-600 animate-pulse" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  Live Dashboard
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent leading-tight">
                Dashboard Inventory
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Pantau dan kelola inventory Anda dengan{" "}
                <span className="text-violet-600 font-semibold">
                  analitik real-time
                </span>{" "}
                ✨
              </p>

              <div className="flex justify-center items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-violet-600">
                    {totalItems}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Items
                  </div>
                </div>
                <div className="w-1 h-8 bg-gradient-to-b from-violet-400 to-purple-600 rounded-full"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">
                    {totalStockIn}
                  </div>
                  <div className="text-sm text-muted-foreground">Stock In</div>
                </div>
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-600 rounded-full"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {totalStockOut}
                  </div>
                  <div className="text-sm text-muted-foreground">Stock Out</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {statsCards.map((card, index) => (
              <Card
                key={card.title}
                className="group relative overflow-hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
                ></div>
                <div className="absolute top-4 right-4 opacity-20">
                  <card.icon className="w-16 h-16" />
                </div>

                <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {card.title}
                  </CardTitle>
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${card.iconBg} shadow-xl group-hover:scale-110 transition-transform duration-300`}
                  >
                    <card.icon
                      className={`h-6 w-6 bg-gradient-to-br ${card.gradient} bg-clip-text text-transparent`}
                    />
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-3">
                  <div className="flex items-end space-x-2">
                    <div
                      className={`text-4xl font-black bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}
                    >
                      {card.value}
                    </div>
                    <Badge
                      className={`${
                        card.trend.includes("+")
                          ? "bg-green-100 text-green-700"
                          : card.trend.includes("-")
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      } border-0 text-xs px-2 py-1`}
                    >
                      {card.trend}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {card.subtitle}
                  </p>

                  <div className="pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                    <p className="text-xs text-muted-foreground font-medium">
                      {card.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Alert className="border-yellow-400 bg-yellow-100/60 dark:bg-yellow-900/20 dark:border-yellow-700/50">
              <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl">
                <Zap className="h-5 w-5 text-white animate-bounce" />
              </div>
              <AlertDescription className="text-yellow-800 dark:text-yellow-200 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <strong className="text-lg">
                      ⚠️ Peringatan Stok Rendah!
                    </strong>
                    <p className="text-sm mt-1">
                      {lowStockItems.length} barang memiliki stok rendah dan
                      perlu segera diisi ulang
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lowStockItems
                      .slice(0, 3)
                      .map((item: Record<string, unknown>) => (
                        <Badge
                          key={item.id as string}
                          className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg"
                        >
                          {item.name as string}
                        </Badge>
                      ))}
                    {lowStockItems.length > 3 && (
                      <Badge className="bg-gray-500 text-white border-0">
                        +{lowStockItems.length - 3} lainnya
                      </Badge>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-10">
            {/* Recent Transactions */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/30 dark:to-violet-900/30">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-violet-100 dark:from-purple-900/50 dark:to-violet-900/50 shadow-xl">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Transaksi Terbaru</span>
                    <p className="text-sm text-muted-foreground font-normal">
                      Aktivitas inventory terkini
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {allTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Tipe
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Barang
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Tanggal
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Detail
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Jumlah
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTransactions.map(
                          (transaction: Record<string, unknown>) => {
                            const item = items.find(
                              (i: Record<string, unknown>) =>
                                i.id === transaction.itemId
                            );
                            return (
                              <tr
                                key={transaction.id as string}
                                className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className={`p-2 rounded-lg ${
                                        (transaction.type as string) === "in"
                                          ? "bg-emerald-100 dark:bg-emerald-900/30"
                                          : "bg-red-100 dark:bg-red-900/30"
                                      }`}
                                    >
                                      {(transaction.type as string) === "in" ? (
                                        <ArrowUp className="w-4 h-4 text-emerald-600" />
                                      ) : (
                                        <ArrowDown className="w-4 h-4 text-red-600" />
                                      )}
                                    </div>
                                    <span className="text-sm font-medium">
                                      {(transaction.type as string) === "in"
                                        ? "Masuk"
                                        : "Keluar"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <div>
                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                      {(item?.name as string) || "Unknown Item"}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                      {String(
                                        categories.find(
                                          (c: Record<string, unknown>) =>
                                            c.id === item?.categoryId
                                        )?.name || ""
                                      )}
                                    </p>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-slate-600 dark:text-slate-300">
                                    {new Date(
                                      transaction.date as string
                                    ).toLocaleDateString("id-ID", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm text-slate-600 dark:text-slate-300">
                                    {String(
                                      transaction.supplier ||
                                        transaction.purpose ||
                                        "-"
                                    )}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <Badge
                                    className={`${
                                      (transaction.type as string) === "in"
                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    } border-0 font-semibold`}
                                  >
                                    {(transaction.type as string) === "in"
                                      ? "+"
                                      : "-"}
                                    {transaction.quantity as number}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <TrendingUp className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">
                      Belum ada transaksi 📊
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Mulai tambahkan transaksi untuk melihat aktivitas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Items by Stock */}
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
              <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 shadow-xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-xl font-bold">Sisa Stok Barang</span>
                    <p className="text-sm text-muted-foreground font-normal">
                      Ranking berdasarkan sisa stok (Stock + Stock In - Stock
                      Out)
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {topItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Ranking
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Barang
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Kategori
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Lokasi
                          </th>
                          <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                            Sisa Stok
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topItems.map(
                          (item: Record<string, unknown>, index: number) => (
                            <tr
                              key={item.id as string}
                              className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                                      index === 0
                                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                                        : index === 1
                                        ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                        : index === 2
                                        ? "bg-gradient-to-r from-amber-600 to-amber-700"
                                        : "bg-gradient-to-r from-blue-500 to-purple-600"
                                    }`}
                                  >
                                    {index + 1}
                                  </div>
                                  {index < 3 && (
                                    <span className="text-lg">
                                      {index === 0
                                        ? "🥇"
                                        : index === 1
                                        ? "🥈"
                                        : "🥉"}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                                    {item.name as string}
                                  </p>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    {item.unit as string}
                                  </p>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                  {String(
                                    categories.find(
                                      (c: Record<string, unknown>) =>
                                        c.id === item.categoryId
                                    )?.name || ""
                                  )}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-sm text-slate-600 dark:text-slate-300">
                                  {item.location as string}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div>
                                  <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                                    {item.remainingStock as number}
                                  </p>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    tersisa
                                  </p>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                      <BarChart3 className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">
                      Belum ada barang 📦
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Tambahkan barang untuk melihat ranking stok
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Dashboard;
