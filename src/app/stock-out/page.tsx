"use client";
import React, { useState } from "react";
// import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      // Refetch transactions to show the new entry
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Form Barang Keluar</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Recent Stock Out Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Transaksi Barang Keluar Terbaru</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Memuat data...</p>
                </div>
              )}

              {transactionsError && (
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
              )}

              {!isLoadingTransactions && !transactionsError && (
                <div className="space-y-3">
                  {transactions
                    .sort(
                      (
                        a: Record<string, unknown>,
                        b: Record<string, unknown>
                      ) =>
                        new Date(b.date as string).getTime() -
                        new Date(a.date as string).getTime()
                    )
                    .slice(0, 5)
                    .map((transaction: Record<string, unknown>) => {
                      const item = items.find(
                        (i: { id: string }) =>
                          (i.id as string) === (transaction.itemId as string)
                      );
                      return (
                        <div
                          key={transaction.id as string}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">
                              {(item?.name as string) || "Unknown Item"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.purpose
                                ? (transaction.purpose as string)
                                : "Tidak ada keperluan"}{" "}
                              •{" "}
                              {new Date(
                                transaction.date as string
                              ).toLocaleDateString("id-ID")}
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
                            {typeof transaction.notes === "string" &&
                              transaction.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {transaction.notes}
                                </p>
                              )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-inventory-red">
                              -{transaction.quantity as number}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item?.unit as string}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                  {transactions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Belum ada transaksi barang keluar
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default StockOutPage;
