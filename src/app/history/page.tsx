"use client";
import React, { useState } from "react";
// import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowUp, ArrowDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useItemsQuery } from "@/hooks/useItems";
import { useCategoriesQuery } from "@/hooks/useCategories";

const HistoryPage = () => {
  // const { state, getCategoryName } = useInventory();
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch items, categories and transactions using React Query
  const { data: items = [] } = useItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();

  const {
    data: stockInTransactions = [],
    isLoading: isLoadingStockIn,
    error: stockInError,
  } = useQuery({
    queryKey: ["stock-in"],
    queryFn: async () => {
      const res = await fetch("/api/stock-in");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
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
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
  });

  // Combine and format transactions
  const allTransactions = [
    ...stockInTransactions.map((t: Record<string, unknown>) => ({
      ...t,
      type: "in",
    })),
    ...stockOutTransactions.map((t: Record<string, unknown>) => ({
      ...t,
      type: "out",
    })),
  ];

  const isLoading = isLoadingStockIn || isLoadingStockOut;
  const hasError = stockInError || stockOutError;

  const filteredTransactions = allTransactions
    .filter((transaction) => {
      const item = items.find(
        (i: Record<string, unknown>) =>
          (i.id as string) === (transaction.itemId as string)
      );
      const matchesType =
        filterType === "all" || (transaction.type as string) === filterType;
      const matchesDate =
        !filterDate ||
        new Date(transaction.date as string).toDateString() ===
          new Date(filterDate).toDateString();
      const matchesSearch =
        !searchTerm ||
        (item?.name as string)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item?.code as string)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (transaction.supplier as string)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (transaction.purpose as string)
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      return matchesType && matchesDate && matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime()
    );

  const totalIn = stockInTransactions.reduce(
    (sum: number, t: Record<string, unknown>) => sum + (t.quantity as number),
    0
  );
  const totalOut = stockOutTransactions.reduce(
    (sum: number, t: Record<string, unknown>) => sum + (t.quantity as number),
    0
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="w-8 h-8 text-inventory-purple mr-3" />
            Histori Transaksi
          </h1>
          <p className="text-muted-foreground mt-2">
            Riwayat semua transaksi barang masuk dan keluar
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="w-8 h-8 text-inventory-purple mr-3" />
            Histori Transaksi
          </h1>
          <p className="text-muted-foreground mt-2">
            Riwayat semua transaksi barang masuk dan keluar
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-red-600">Error loading data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Calendar className="w-8 h-8 text-inventory-purple mr-3" />
          Histori Transaksi
        </h1>
        <p className="text-muted-foreground mt-2">
          Riwayat semua transaksi barang masuk dan keluar
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Transaksi
            </CardTitle>
            <Calendar className="h-4 w-4 text-inventory-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-inventory-purple">
              {allTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground">Semua transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Masuk
            </CardTitle>
            <ArrowUp className="h-4 w-4 text-inventory-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-inventory-green">
              {totalIn}
            </div>
            <p className="text-xs text-muted-foreground">Unit barang masuk</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Keluar
            </CardTitle>
            <ArrowDown className="h-4 w-4 text-inventory-red" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-inventory-red">
              {totalOut}
            </div>
            <p className="text-xs text-muted-foreground">Unit barang keluar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Cari berdasarkan barang, supplier, atau keperluan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Semua Transaksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Transaksi</SelectItem>
              <SelectItem value="in">Barang Masuk</SelectItem>
              <SelectItem value="out">Barang Keluar</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-48"
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
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Transactions List */}

      <CardHeader>
        <CardTitle>Daftar Transaksi ({filteredTransactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => {
              const item = items.find(
                (i: Record<string, unknown>) =>
                  (i.id as string) === (transaction.itemId as string)
              );
              return (
                <div
                  key={transaction.id as string}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-full ${
                        (transaction.type as string) === "in"
                          ? "bg-inventory-green/20 text-inventory-green"
                          : "bg-inventory-red/20 text-inventory-red"
                      }`}
                    >
                      {(transaction.type as string) === "in" ? (
                        <ArrowUp className="w-4 h-4" />
                      ) : (
                        <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">
                          {(item?.name as string) || "Unknown Item"}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {item?.code as string}
                        </Badge>
                        <Badge
                          variant={
                            (transaction.type as string) === "in"
                              ? "default"
                              : "destructive"
                          }
                          className={`text-xs ${
                            (transaction.type as string) === "in"
                              ? "bg-inventory-green"
                              : "bg-inventory-red"
                          }`}
                        >
                          {(transaction.type as string) === "in"
                            ? "MASUK"
                            : "KELUAR"}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          {new Date(
                            transaction.date as string
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          <br />
                          <span className="italic">
                            Created:{" "}
                            {transaction.createdAt
                              ? new Date(
                                  transaction.createdAt as string
                                ).toLocaleString("id-ID", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "-"}
                          </span>
                        </p>
                        {transaction.supplier && (
                          <p>Supplier: {transaction.supplier as string}</p>
                        )}
                        {transaction.purpose && (
                          <p>Keperluan: {transaction.purpose as string}</p>
                        )}
                        {transaction.notes && (
                          <p>Catatan: {transaction.notes as string}</p>
                        )}
                        {item && (
                          <p>
                            Kategori:{" "}
                            {categories.find(
                              (c: Record<string, unknown>) =>
                                c.id === item.categoryId
                            )?.name || item.categoryId}{" "}
                            • Lokasi: {item.location as string}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-2xl font-bold ${
                        (transaction.type as string) === "in"
                          ? "text-inventory-green"
                          : "text-inventory-red"
                      }`}
                    >
                      {(transaction.type as string) === "in" ? "+" : "-"}
                      {transaction.quantity as number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {(item?.unit as string) || "unit"}
                    </p>
                  </div>
                </div>
              );
            })
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
      </CardContent>
    </div>
  );
};

export default HistoryPage;
