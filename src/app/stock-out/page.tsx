"use client";
import React, { useState } from "react";
// import { useInventory } from "@/contexts/InventoryContext";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowDown } from "lucide-react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { useItemsQuery } from "@/hooks/useItems";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";

const StockOutPage = () => {
  // const { state, addTransaction, getCategoryName } = useInventory();
  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 0,
    purpose: "",
    notes: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { data: items = [] } = useItemsQuery();
  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey: ["stock-out"],
    queryFn: async () => {
      const res = await fetch("/api/stock-out");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      return data;
    },
    retry: 3,
    retryDelay: 1000,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const itemsPerPage = 10;
  const paginatedTransactions = (transactions as Array<Record<string, unknown>>)
    .sort(
      (a, b) =>
        new Date(b.date as string).getTime() -
        new Date(a.date as string).getTime()
    )
    .slice(0, itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      itemId: formData.itemId,
      quantity: formData.quantity,
      purpose: formData.purpose,
      notes: formData.notes,
      date: new Date(formData.date).toISOString(),
    };

    try {
      const response = await fetch("/api/stock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || `HTTP error! status: ${response.status}`);
        return;
      }

      setFormData({
        itemId: "",
        quantity: 0,
        purpose: "",
        notes: "",
        date: new Date().toISOString().split("T")[0],
      });
      setModalOpen(false);
      refetchTransactions();
    } catch (error) {
      alert(
        "Gagal submit stock-out: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const selectedItem = items.find(
    (item: { id: string; stock: number; unit: string; minStock: number }) =>
      (item.id as string) === formData.itemId
  );
  const willBeOutOfStock =
    selectedItem && (selectedItem.stock as number) - formData.quantity <= 0;
  const willBeLowStock =
    selectedItem &&
    (selectedItem.stock as number) - formData.quantity <=
      (selectedItem.minStock as number);

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-rose-100 via-blue-50 to-white py-8 px-2 sm:px-0">
          {/* Header ala Items/Categories/Stock In Page */}
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 md:px-0 mt-4 mb-10">
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">
                Barang Keluar
              </h1>
              <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                Input barang keluar untuk mengurangi stok inventory
              </p>
            </div>
            <div className="flex justify-center md:justify-end mt-4 md:mt-0">
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-rose-400 to-pink-300 hover:from-rose-500 hover:to-pink-400 text-white px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-base font-semibold transition-transform duration-150 hover:scale-105 focus:ring-2 focus:ring-rose-200 focus:outline-none"
                    onClick={() => setModalOpen(true)}
                  >
                    <ArrowDown className="w-5 h-5 mr-2" />
                    Barang Keluar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg w-full p-0 bg-white/95 backdrop-blur-md border-0 shadow-2xl rounded-2xl">
                  <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold text-gray-900">
                      Form Barang Keluar
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-4 px-6 pb-6 pt-2"
                  >
                    <div>
                      <Label
                        htmlFor="item"
                        className="text-gray-700 font-medium"
                      >
                        Pilih Barang
                      </Label>
                      <Select
                        value={formData.itemId}
                        onValueChange={(value) =>
                          setFormData({ ...formData, itemId: value })
                        }
                      >
                        <SelectTrigger className="border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-lg bg-white">
                          <SelectValue placeholder="Pilih barang" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {items
                            .filter((item: { stock: number }) => item.stock > 0)
                            .map(
                              (item: {
                                id: string;
                                name: string;
                                code: string;
                                stock: number;
                                unit: string;
                              }) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name} - {item.code} ({item.stock}{" "}
                                  {item.unit} tersedia)
                                </SelectItem>
                              )
                            )}
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
                          max={selectedItem?.stock || 0}
                          value={formData.quantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              quantity: parseInt(e.target.value) || 0,
                            })
                          }
                          placeholder="0"
                          className="border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-lg"
                          required
                        />
                        {selectedItem && (
                          <p className="text-xs text-gray-500 mt-1">
                            Tersedia: {selectedItem.stock} {selectedItem.unit}
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
                          className="border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="purpose"
                        className="text-gray-700 font-medium"
                      >
                        Keperluan
                      </Label>
                      <Input
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) =>
                          setFormData({ ...formData, purpose: e.target.value })
                        }
                        placeholder="Tujuan penggunaan barang"
                        className="border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-lg"
                        required
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
                        className="border-gray-200 focus:border-rose-400 focus:ring-rose-400 rounded-lg"
                      />
                    </div>
                    {/* Warnings */}
                    {willBeOutOfStock && (
                      <Alert className="border-rose-300 bg-rose-200/60">
                        <AlertDescription>
                          <strong>Peringatan:</strong> Stok akan habis setelah
                          transaksi ini!
                        </AlertDescription>
                      </Alert>
                    )}
                    {!willBeOutOfStock && willBeLowStock && (
                      <Alert className="border-yellow-300 bg-yellow-100/60">
                        <AlertDescription>
                          <strong>Perhatian:</strong> Stok akan berada di bawah
                          minimum setelah transaksi ini.
                        </AlertDescription>
                      </Alert>
                    )}
                    <DialogFooter className="gap-2 pt-2">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-rose-400 to-pink-300 hover:from-rose-500 hover:to-pink-400 text-white font-semibold"
                        disabled={
                          !formData.itemId ||
                          formData.quantity <= 0 ||
                          !selectedItem ||
                          formData.quantity > selectedItem.stock
                        }
                      >
                        <ArrowDown className="w-4 h-4 mr-2" />
                        Keluarkan Barang
                      </Button>
                      <DialogClose asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                        >
                          Batal
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabel Transaksi Barang Keluar Terbaru */}
          <div className="max-w-4xl mx-auto border-t border-gray-200 pt-6">
            <h2 className="text-lg font-bold mb-4 text-rose-700 flex items-center gap-2 px-4 md:px-0">
              <ArrowDown className="w-5 h-5 text-rose-600" />
              Transaksi Barang Keluar Terbaru
            </h2>
            {isLoadingTransactions ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Memuat data...</p>
              </div>
            ) : transactionsError ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-rose-700 font-medium">
                    Gagal memuat data
                  </span>
                </div>
                <p className="text-rose-600 text-sm mb-3">
                  {transactionsError instanceof Error
                    ? transactionsError.message
                    : "Gagal mengambil data transaksi"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchTransactions()}
                  className="text-rose-600 border-rose-300 hover:bg-rose-50"
                >
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Tabel untuk desktop */}
                <table className="w-full text-sm md:text-base border-collapse hidden md:table">
                  <thead>
                    <tr className="bg-rose-50 text-rose-800 font-semibold text-xs md:text-base uppercase">
                      <th className="py-3 px-4 text-left">Barang</th>
                      <th className="py-3 px-4 text-left">Kode</th>
                      <th className="py-3 px-4 text-right">Jumlah</th>
                      <th className="py-3 px-4 text-left">Tanggal</th>
                      <th className="py-3 px-4 text-left hidden sm:table-cell">
                        Keperluan
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
                          (i: { id: string }) =>
                            (i.id as string) === (transaction.itemId as string)
                        );
                        return (
                          <tr
                            key={transaction.id as string}
                            className="border-b border-gray-200 hover:bg-rose-50/60"
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
                            <td className="py-3 px-4 text-right font-bold text-rose-700 whitespace-nowrap">
                              -{transaction.quantity as number}
                            </td>
                            <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                              {(transaction.date as string)?.slice(0, 10)}
                            </td>
                            <td className="py-3 px-4 text-slate-700 whitespace-nowrap hidden sm:table-cell">
                              {typeof transaction.purpose === "string" &&
                              transaction.purpose
                                ? transaction.purpose
                                : "-"}
                            </td>
                            <td className="py-3 px-4 text-slate-700 whitespace-nowrap hidden sm:table-cell">
                              {item?.unit as string}
                            </td>
                            <td className="py-3 px-4 text-slate-400 whitespace-nowrap hidden sm:table-cell">
                              {typeof transaction.notes === "string" &&
                              transaction.notes
                                ? transaction.notes
                                : "-"}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
                {/* Card untuk mobile */}
                <div className="md:hidden space-y-4 mt-4">
                  {paginatedTransactions.map(
                    (transaction: Record<string, unknown>) => {
                      const item = items.find(
                        (i: { id: string }) =>
                          (i.id as string) === (transaction.itemId as string)
                      );
                      return (
                        <div
                          key={transaction.id as string}
                          className="border-l-4 border-rose-400 bg-white p-4 flex flex-col gap-2 border-b border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-1.5 rounded-full bg-rose-100 text-rose-700 mt-1">
                              <ArrowDown className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="font-semibold text-base">
                                  {(item?.name as string) || "Unknown Item"}
                                </span>
                                <span className="font-bold text-rose-700 text-base whitespace-nowrap">
                                  -{transaction.quantity as number}
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
                                  <span className="text-slate-400">
                                    Tanggal:
                                  </span>
                                  <span>
                                    {(transaction.date as string)?.slice(0, 10)}
                                  </span>
                                </div>
                                {typeof transaction.purpose === "string" &&
                                  transaction.purpose && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400">
                                        Keperluan:
                                      </span>
                                      <span>
                                        {transaction.purpose as string}
                                      </span>
                                    </div>
                                  )}
                                {typeof transaction.notes === "string" &&
                                  transaction.notes && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-400">
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

export default StockOutPage;
