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
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <ArrowUp className="w-8 h-8 text-inventory-green mr-3" />
              Barang Masuk
            </h1>
            <p className="text-muted-foreground mt-2">
              Input barang masuk untuk menambah stok inventory
            </p>
          </div>

          {/* Tombol Tambah Barang Masuk */}
          <div className="flex justify-end mb-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-inventory-green hover:bg-inventory-green/90"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Tambah Barang Masuk
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Form Barang Masuk</DialogTitle>
                </DialogHeader>
                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-red-700 text-sm">{submitError}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="item">Pilih Barang</Label>
                    <Select
                      value={formData.itemId}
                      onValueChange={(value: string) =>
                        setFormData({ ...formData, itemId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih barang" />
                      </SelectTrigger>
                      <SelectContent>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Jumlah</Label>
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
                        required
                      />
                      {selectedItem && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Satuan: {selectedItem.unit}
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
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) =>
                        setFormData({ ...formData, supplier: e.target.value })
                      }
                      placeholder="Nama supplier atau vendor"
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

                  <Button
                    type="submit"
                    className="w-full bg-inventory-green hover:bg-inventory-green/90"
                    disabled={
                      !formData.itemId || formData.quantity <= 0 || isSubmitting
                    }
                  >
                    <ArrowUp className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Menyimpan..." : "Tambah Barang Masuk"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabel Transaksi Barang Masuk Terbaru */}
          <div className=" p-4">
            <h2 className="text-base font-bold mb-4">
              Transaksi Barang Masuk Terbaru
            </h2>
            {isLoadingTransactions ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Memuat data...</p>
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
                      <th className="py-2 px-3 text-left">Supplier</th>
                      <th className="py-2 px-3 text-right">Jumlah</th>
                      <th className="py-2 px-3 text-left">Satuan</th>
                      <th className="py-2 px-3 text-left">Tanggal</th>
                      <th className="py-2 px-3 text-left">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(transactions as Array<Record<string, unknown>>)
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
                            (i: Record<string, unknown>) =>
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
                                {transaction.supplier as string}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-indigo-700">
                                +{transaction.quantity as number}
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
                                {typeof transaction.notes === "string"
                                  ? transaction.notes
                                  : ""}
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
                          className="py-12 text-center text-indigo-700 bg-indigo-50 text-base font-semibold"
                        >
                          Belum ada transaksi barang masuk
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

export default StockInPage;
