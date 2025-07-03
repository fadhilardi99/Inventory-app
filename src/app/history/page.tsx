"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ArrowUp, ArrowDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useItemsQuery } from "@/hooks/useItems";
import { useCategoriesQuery } from "@/hooks/useCategories";

// TypeScript interfaces for better type safety
interface Item {
  id: string;
  name: string;
  code: string;
  unit: string;
  location?: string;
  categoryId?: string;
}

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  itemId: string;
  quantity: number;
  date: string;
  supplier?: string;
  purpose?: string;
  notes?: string;
  type: "in" | "out";
}

const HistoryPage = () => {
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: items = [] } = useItemsQuery() as { data: Item[] };
  const { data: categories = [] } = useCategoriesQuery() as {
    data: Category[];
  };
  const {
    data: stockInTransactions = [],
    isLoading: isLoadingStockIn,
    error: stockInError,
  } = useQuery({
    queryKey: ["stock-in"],
    queryFn: async () => {
      const res = await fetch("/api/stock-in");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    },
  });
  const {
    data: stockOutTransactions = [],
    isLoading: isLoadingStockOut,
    error: stockOutError,
  } = useQuery({
    queryKey: ["stock-out"],
    queryFn: async () => {
      const res = await fetch("/api/stock-out");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    },
  });
  const stockIn: Omit<Transaction, "type">[] = stockInTransactions as Omit<
    Transaction,
    "type"
  >[];
  const stockOut: Omit<Transaction, "type">[] = stockOutTransactions as Omit<
    Transaction,
    "type"
  >[];
  const allTransactions: Transaction[] = [
    ...stockIn.map((t) => ({ ...t, type: "in" as const })),
    ...stockOut.map((t) => ({ ...t, type: "out" as const })),
  ];
  const isLoading = isLoadingStockIn || isLoadingStockOut;
  const hasError = stockInError || stockOutError;
  const filteredTransactions: Transaction[] = allTransactions
    .filter((transaction: Transaction) => {
      const item = items.find((i: Item) => i.id === transaction.itemId);
      const matchesType =
        filterType === "all" || transaction.type === filterType;
      const matchesDate =
        !filterDate ||
        transaction.date?.slice(0, 10) ===
          new Date(filterDate).toISOString().slice(0, 10);
      const matchesSearch =
        !searchTerm ||
        item?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.supplier
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesDate && matchesSearch;
    })
    .sort(
      (a: Transaction, b: Transaction) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  const totalIn = stockIn.reduce(
    (sum: number, t) => sum + (t.quantity || 0),
    0
  );
  const totalOut = stockOut.reduce(
    (sum: number, t) => sum + (t.quantity || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-8 px-2 sm:px-0">
      {/* Header ala Items/Categories/Stock In/Stock Out Page */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 md:px-0 mt-4 mb-10">
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">
            Histori Transaksi
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
            Riwayat semua transaksi barang masuk dan keluar
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <Calendar className="h-6 w-6 text-blue-500 mb-2" />
          <div className="text-2xl font-bold text-blue-700">
            {allTransactions.length}
          </div>
          <div className="text-xs text-gray-500">Semua transaksi</div>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <ArrowUp className="h-6 w-6 text-green-500 mb-2" />
          <div className="text-2xl font-bold text-green-700">{totalIn}</div>
          <div className="text-xs text-gray-500">Unit barang masuk</div>
        </div>
        <div className="bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center">
          <ArrowDown className="h-6 w-6 text-red-500 mb-2" />
          <div className="text-2xl font-bold text-red-700">{totalOut}</div>
          <div className="text-xs text-gray-500">Unit barang keluar</div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto bg-white/80 rounded-2xl shadow-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Cari barang, supplier, keperluan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-lg border-gray-200 focus:border-green-500 focus:ring-green-500 bg-white"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 rounded-lg border-gray-200 bg-white">
              <SelectValue placeholder="Semua Transaksi" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Semua Transaksi</SelectItem>
              <SelectItem value="in">Barang Masuk</SelectItem>
              <SelectItem value="out">Barang Keluar</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-36 rounded-lg border-gray-200 bg-white"
            placeholder="Filter tanggal"
          />
          {(filterDate || searchTerm || filterType !== "all") && (
            <Button
              variant="outline"
              onClick={() => {
                setFilterDate("");
                setSearchTerm("");
                setFilterType("all");
              }}
              className="rounded-lg"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="max-w-4xl mx-auto ">
        <h2 className="text-lg font-bold mb-6 text-green-700 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Daftar Transaksi ({filteredTransactions.length})
        </h2>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : hasError ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700 font-medium">
                Error loading data
              </span>
            </div>
            <p className="text-red-600 text-sm mb-3">Silakan coba lagi.</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Table for desktop */}
            <table className="w-full text-sm md:text-base  overflow-hidden shadow-md bg-white border-separate border-spacing-0 hidden md:table">
              <thead>
                <tr className="bg-gradient-to-r from-green-400 to-blue-300 text-white font-semibold text-xs md:text-base uppercase">
                  <th className="py-3 px-4 text-left">Barang</th>
                  <th className="py-3 px-4 text-left">Kode</th>
                  <th className="py-3 px-4 text-left">Tipe</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                  <th className="py-3 px-4 text-left">Tanggal</th>
                  <th className="py-3 px-4 text-left">Supplier</th>
                  <th className="py-3 px-4 text-left">Keperluan</th>
                  <th className="py-3 px-4 text-left">Catatan</th>
                  <th className="py-3 px-4 text-left">Kategori</th>
                  <th className="py-3 px-4 text-left">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(
                  (transaction: Transaction, idx: number) => {
                    const item = items.find(
                      (i: Item) => i.id === transaction.itemId
                    );
                    const category = categories.find(
                      (c: Category) => c.id === item?.categoryId
                    );
                    return (
                      <tr
                        key={transaction.id}
                        className={`transition-colors ${
                          idx % 2 === 1 ? "bg-green-50/60" : "bg-white"
                        } hover:bg-blue-50/60 group`}
                        style={{
                          boxShadow:
                            idx % 2 === 1 ? "0 1px 0 0 #e0f2fe" : undefined,
                        }}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {item?.name || "Unknown Item"}
                          <div className="text-xs text-slate-400 font-normal">
                            {item?.code || "-"}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {item?.code || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                              transaction.type === "in"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {transaction.type === "in" ? "MASUK" : "KELUAR"}
                          </span>
                        </td>
                        <td
                          className={`py-3 px-4 text-right font-bold ${
                            transaction.type === "in"
                              ? "text-green-700"
                              : "text-red-700"
                          } whitespace-nowrap`}
                        >
                          {transaction.type === "in" ? "+" : "-"}
                          {transaction.quantity}
                          <span className="ml-1 text-xs text-slate-400">
                            {item?.unit || "unit"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {transaction.date?.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {transaction.supplier || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {transaction.purpose || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {transaction.notes || ""}
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {category?.name || item?.categoryId || "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                          {item?.location || "-"}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
            {/* Cards for mobile */}
            <div className="md:hidden mt-4">
              {filteredTransactions.map((transaction: Transaction) => {
                const item = items.find(
                  (i: Item) => i.id === transaction.itemId
                );
                const category = categories.find(
                  (c: Category) => c.id === item?.categoryId
                );
                return (
                  <div
                    key={transaction.id}
                    className={`border-l-4 ${
                      transaction.type === "in"
                        ? "border-green-400"
                        : "border-red-400"
                    } bg-white p-4 flex flex-col gap-2 border-b border-gray-200`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-1.5 rounded-full mt-1 ${
                          transaction.type === "in"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.type === "in" ? (
                          <ArrowUp className="w-4 h-4" />
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-base">
                            {item?.name || "Unknown Item"}
                          </span>
                          <span
                            className={`font-bold text-base whitespace-nowrap ${
                              transaction.type === "in"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {transaction.type === "in" ? "+" : "-"}
                            {transaction.quantity}
                          </span>
                        </div>
                        <div className="text-sm text-slate-500">
                          {item?.code || "-"}
                          <span className="text-xs text-slate-400 ml-1">
                            ({item?.unit || "unit"})
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-slate-600 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-20 text-slate-400 shrink-0">
                              Tanggal:
                            </span>
                            <span>{transaction.date?.slice(0, 10)}</span>
                          </div>
                          {transaction.type === "in" &&
                            transaction.supplier && (
                              <div className="flex items-center gap-2">
                                <span className="w-20 text-slate-400 shrink-0">
                                  Supplier:
                                </span>
                                <span>{transaction.supplier}</span>
                              </div>
                            )}
                          {transaction.type === "out" &&
                            transaction.purpose && (
                              <div className="flex items-center gap-2">
                                <span className="w-20 text-slate-400 shrink-0">
                                  Keperluan:
                                </span>
                                <span>{transaction.purpose}</span>
                              </div>
                            )}
                          <div className="flex items-center gap-2">
                            <span className="w-20 text-slate-400 shrink-0">
                              Kategori:
                            </span>
                            <span>
                              {category?.name || item?.categoryId || "-"}
                            </span>
                          </div>
                          {item?.location && (
                            <div className="flex items-center gap-2">
                              <span className="w-20 text-slate-400 shrink-0">
                                Lokasi:
                              </span>
                              <span>{item.location}</span>
                            </div>
                          )}
                          {transaction.notes && (
                            <div className="flex items-start gap-2">
                              <span className="w-20 text-slate-400 shrink-0">
                                Catatan:
                              </span>
                              <span className="italic">
                                {transaction.notes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterDate || filterType !== "all"
                ? "Tidak ada transaksi yang sesuai dengan filter"
                : "Belum ada transaksi yang tercatat"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
