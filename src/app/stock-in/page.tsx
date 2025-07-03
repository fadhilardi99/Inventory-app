"use client";
import React, { useState } from "react";
// import { useInventory } from "@/contexts/InventoryContext";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, AlertCircle } from "lucide-react";
import { useItemsQuery } from "@/hooks/useItems";
import { useQuery } from "@tanstack/react-query";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const StockInPage = () => {
  // const { state, addTransaction, getCategoryName } = useInventory();
  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 0,
    supplier: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: items = [] } = useItemsQuery();
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["stock-in"],
    queryFn: async () => {
      const res = await fetch("/api/stock-in");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      return res.json();
    },
    retry: 3,
    retryDelay: 1000,
  });

  const paginatedTransactions = (transactions as Array<Record<string, unknown>>)
    .sort(
      (a, b) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime()
    )
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(
    (transactions as Array<Record<string, unknown>>).length / itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/stock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: formData.itemId,
          quantity: formData.quantity,
          supplier: formData.supplier,
          notes: formData.notes,
          date: new Date(formData.date).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Reset form on success
      setFormData({
        itemId: "",
        quantity: 0,
        supplier: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });
      setIsDialogOpen(false);
      // Refetch transactions to show the new entry
      refetchTransactions();
    } catch (error) {
      console.error("Error submitting stock-in:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit stock-in"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItem = items.find(
    (item: Record<string, unknown>) => (item.id as string) === formData.itemId
  );

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-8 px-2 sm:px-0">
          {/* Header ala Items/Categories Page */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 md:px-0 mt-4 mb-10">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">
                Barang Masuk
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                Input barang masuk untuk menambah stok inventory
              </p>
            </div>
            <div className="flex justify-center md:justify-end mt-4 md:mt-0">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-base font-semibold transition-transform duration-150 hover:scale-105 focus:ring-2 focus:ring-green-200 focus:outline-none"
                  >
                    <ArrowUp className="w-5 h-5 mr-2" />
                    Tambah Barang Masuk
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-white/95 backdrop-blur-md border-0 shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      Form Barang Masuk
                    </DialogTitle>
                  </DialogHeader>
                  {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-red-700 text-sm">
                        {submitError}
                      </span>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label
                        htmlFor="item"
                        className="text-gray-700 font-medium"
                      >
                        Pilih Barang
                      </Label>
                      <Select
                        value={formData.itemId}
                        onValueChange={(value: string) =>
                          setFormData({ ...formData, itemId: value })
                        }
                      >
                        <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg bg-white">
                          <SelectValue placeholder="Pilih barang" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {items.map((item: Record<string, unknown>) => (
                            <SelectItem
                              key={item.id as string}
                              value={item.id as string}
                            >
                              {String(item.name)} - {String(item.code)} (
                              {String(item.stock)} {String(item.unit)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="quantity"
                          className="text-gray-700 font-medium"
                        >
                          Jumlah
                        </Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                          required
                        />
                        {selectedItem && (
                          <p className="text-xs text-gray-500 mt-1">
                            Satuan: {selectedItem.unit}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="date"
                          className="text-gray-700 font-medium"
                        >
                          Tanggal
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          className="border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="supplier"
                        className="text-gray-700 font-medium"
                      >
                        Supplier
                      </Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) =>
                          setFormData({ ...formData, supplier: e.target.value })
                        }
                        placeholder="Nama supplier atau vendor"
                        className="border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="notes"
                        className="text-gray-700 font-medium"
                      >
                        Catatan
                      </Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        placeholder="Catatan tambahan (opsional)"
                        rows={3}
                        className="border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-lg font-semibold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                      disabled={
                        !formData.itemId ||
                        formData.quantity <= 0 ||
                        isSubmitting
                      }
                    >
                      <ArrowUp className="w-5 h-5" />
                      {isSubmitting ? "Menyimpan..." : "Tambah Barang Masuk"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabel Transaksi Barang Masuk Terbaru */}
          <div className="max-w-4xl mx-auto border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold mb-4 text-green-700 flex items-center gap-2 px-4 md:px-0">
              <ArrowUp className="w-5 h-5 text-green-600" />
              Transaksi Barang Masuk Terbaru
            </h2>
            {isLoadingTransactions ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : transactionsError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">
                    Error loading data
                  </span>
                </div>
                <p className="text-red-600 text-sm mb-3">
                  {transactionsError instanceof Error
                    ? transactionsError.message
                    : "Failed to fetch transactions"}
                </p>
                <Button
                  onClick={() => refetchTransactions()}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-collapse hidden md:table">
                  <thead>
                    <tr className="bg-green-50 text-green-800 font-semibold text-xs md:text-base uppercase">
                      <th className="py-3 px-4 text-left">Barang</th>
                      <th className="py-3 px-4 text-left">Kode</th>
                      <th className="py-3 px-4 text-right">Jumlah</th>
                      <th className="py-3 px-4 text-left">Tanggal</th>
                      <th className="py-3 px-4 text-left hidden sm:table-cell">
                        Supplier
                      </th>
                      <th className="py-3 px-4 text-left hidden sm:table-cell">
                        Satuan
                      </th>
                      <th className="py-3 px-4 text-left hidden sm:table-cell">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map(
                      (transaction: Record<string, unknown>) => {
                        const item = items.find(
                          (i: Record<string, unknown>) =>
                            (i.id as string) === (transaction.itemId as string)
                        );
                        return (
                          <tr
                            key={transaction.id as string}
                            className="border-b border-gray-200 hover:bg-green-50/60"
                          >
                            <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                              {(item?.name as string) || "Unknown Item"}
                              <div className="text-xs text-slate-400 font-normal">
                                {(item?.code as string) || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                              {(item?.code as string) || "-"}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-green-700 whitespace-nowrap">
                              +{transaction.quantity as number}
                            </td>
                            <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                              {(transaction.date as string)?.slice(0, 10)}
                            </td>
                            <td className="py-3 px-4 text-slate-700 whitespace-nowrap hidden sm:table-cell">
                              {(transaction.supplier as string) || "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-700 whitespace-nowrap hidden sm:table-cell">
                              {(item?.unit as string) || "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap hidden sm:table-cell">
                              {(transaction.notes as string) || "-"}
                            </td>
                          </tr>
                        );
                      }
                    )}
                    {(transactions as Array<Record<string, unknown>>).length ===
                      0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-green-700 bg-green-50 text-base font-semibold"
                        >
                          Belum ada transaksi barang masuk
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {/* Card untuk mobile */}
                <div className="md:hidden mt-4">
                  {paginatedTransactions.map(
                    (transaction: Record<string, unknown>) => {
                      const item = items.find(
                        (i: Record<string, unknown>) =>
                          (i.id as string) === (transaction.itemId as string)
                      );
                      return (
                        <div
                          key={transaction.id as string}
                          className="border-l-4 border-green-400 bg-white p-4 flex flex-col gap-2 border-b border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-full bg-green-100 text-green-700 mt-1">
                              <ArrowUp className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-base">
                                  {(item?.name as string) || "Unknown Item"}
                                </span>
                                <span className="font-bold text-green-700 text-base whitespace-nowrap">
                                  +{transaction.quantity as number}
                                </span>
                              </div>
                              <div className="text-sm text-slate-500">
                                {(item?.code as string) || "-"}
                                <span className="text-xs text-slate-400 ml-1">
                                  ({(item?.unit as string) || "unit"})
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-slate-600 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="w-20 text-slate-400 shrink-0">
                                    Tanggal:
                                  </span>
                                  <span>
                                    {(transaction.date as string)?.slice(0, 10)}
                                  </span>
                                </div>
                                {typeof transaction.supplier === "string" &&
                                  transaction.supplier && (
                                    <div className="flex items-center gap-2">
                                      <span className="w-20 text-slate-400 shrink-0">
                                        Supplier:
                                      </span>
                                      <span>
                                        {transaction.supplier as string}
                                      </span>
                                    </div>
                                  )}
                                {typeof transaction.notes === "string" &&
                                  transaction.notes && (
                                    <div className="flex items-start gap-2">
                                      <span className="w-20 text-slate-400 shrink-0">
                                        Catatan:
                                      </span>
                                      <span className="italic">
                                        {transaction.notes as string}
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      Menampilkan {(currentPage - 1) * itemsPerPage + 1}–
                      {Math.min(
                        currentPage * itemsPerPage,
                        (transactions as Array<Record<string, unknown>>).length
                      )}
                      dari{" "}
                      {(transactions as Array<Record<string, unknown>>).length}{" "}
                      transaksi
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Sebelumnya
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      >
                        Berikutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default StockInPage;
