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
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ArrowDown className="w-8 h-8 text-inventory-red mr-3" />
              Barang Keluar
            </h1>
            <p className="text-muted-foreground mt-2">
              Input barang keluar untuk mengurangi stok inventory
            </p>
          </div>

          {/* Tombol + Barang Keluar dan Modal */}
          <div className="flex justify-end mb-2">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  className="bg-inventory-red hover:bg-inventory-red/90 font-semibold"
                  onClick={() => setModalOpen(true)}
                >
                  + Barang Keluar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg w-full p-0">
                <DialogHeader className="p-6 pb-2">
                  <DialogTitle>Form Barang Keluar</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 px-6 pb-6 pt-2"
                >
                  <div>
                    <Label htmlFor="item">Pilih Barang</Label>
                    <Select
                      value={formData.itemId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, itemId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih barang" />
                      </SelectTrigger>
                      <SelectContent>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Jumlah</Label>
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
                        required
                      />
                      {selectedItem && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Tersedia: {selectedItem.stock} {selectedItem.unit}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="date">Tanggal</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="purpose">Keperluan</Label>
                    <Input
                      id="purpose"
                      value={formData.purpose}
                      onChange={(e) =>
                        setFormData({ ...formData, purpose: e.target.value })
                      }
                      placeholder="Tujuan penggunaan barang"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Catatan</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder="Catatan tambahan (opsional)"
                      rows={3}
                    />
                  </div>
                  {/* Warnings */}
                  {willBeOutOfStock && (
                    <Alert className="border-inventory-red bg-inventory-red/10">
                      <AlertDescription>
                        <strong>Peringatan:</strong> Stok akan habis setelah
                        transaksi ini!
                      </AlertDescription>
                    </Alert>
                  )}
                  {!willBeOutOfStock && willBeLowStock && (
                    <Alert className="border-inventory-yellow bg-inventory-yellow/10">
                      <AlertDescription>
                        <strong>Perhatian:</strong> Stok akan berada di bawah
                        minimum setelah transaksi ini.
                      </AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter className="gap-2 pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-inventory-red hover:bg-inventory-red/90"
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

          {/* Recent Stock Out Transactions */}
          <div className="p-4">
            <h2 className="text-base font-bold mb-4">
              Transaksi Barang Keluar Terbaru
            </h2>
            {isLoadingTransactions ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat data...</p>
              </div>
            ) : transactionsError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
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
                  variant="outline"
                  size="sm"
                  onClick={() => refetchTransactions()}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-slate-200 text-base rounded-xl shadow-sm overflow-hidden">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold uppercase text-base">
                      <th className="py-2 px-3 text-left">Barang</th>
                      <th className="py-2 px-3 text-left">Kode</th>
                      <th className="py-2 px-3 text-left">Keperluan</th>
                      <th className="py-2 px-3 text-right">Jumlah</th>
                      <th className="py-2 px-3 text-left">Satuan</th>
                      <th className="py-2 px-3 text-left">Tanggal</th>
                      <th className="py-2 px-3 text-left">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions
                      .sort(
                        (
                          a: Record<string, unknown>,
                          b: Record<string, unknown>
                        ) =>
                          new Date(b.date as string).getTime() -
                          new Date(a.date as string).getTime()
                      )
                      .slice(0, 10)
                      .map(
                        (transaction: Record<string, unknown>, idx: number) => {
                          const item = items.find(
                            (i: { id: string }) =>
                              (i.id as string) ===
                              (transaction.itemId as string)
                          );
                          return (
                            <tr
                              key={transaction.id as string}
                              className={`${
                                idx % 2 === 1 ? "bg-indigo-50" : "bg-white"
                              } border-b border-slate-200 hover:bg-indigo-100/60`}
                            >
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {(item?.name as string) || "Unknown Item"}
                                <div className="text-xs text-slate-500">
                                  {(item?.code as string) || "-"}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-xs text-slate-500">
                                {(item?.code as string) || "-"}
                              </td>
                              <td className="py-2 px-3 text-slate-700">
                                {transaction.purpose
                                  ? (transaction.purpose as string)
                                  : "Tidak ada keperluan"}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-red-600">
                                -{transaction.quantity as number}
                              </td>
                              <td className="py-2 px-3 text-slate-700">
                                {item?.unit as string}
                              </td>
                              <td className="py-2 px-3 text-slate-700">
                                {new Date(
                                  transaction.date as string
                                ).toLocaleDateString("id-ID")}
                              </td>
                              <td className="py-2 px-3 text-xs text-slate-500">
                                {typeof transaction.notes === "string" &&
                                transaction.notes
                                  ? transaction.notes
                                  : ""}
                              </td>
                            </tr>
                          );
                        }
                      )}
                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-12 text-center text-indigo-700 bg-indigo-50 text-base font-semibold"
                        >
                          Belum ada transaksi barang keluar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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
