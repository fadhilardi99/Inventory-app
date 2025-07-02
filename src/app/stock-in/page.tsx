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
import { ArrowUp, AlertCircle } from "lucide-react";
import { useItemsQuery } from "@/hooks/useItems";
import { useQuery } from "@tanstack/react-query";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Form Barang Masuk</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Recent Stock In Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Barang Masuk Terbaru</CardTitle>
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
                )}

                {!isLoadingTransactions && !transactionsError && (
                  <div className="space-y-3">
                    {(transactions as Array<Record<string, unknown>>)
                      .filter(() => true)
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
                          (i: Record<string, unknown>) =>
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
                                {transaction.supplier as string} •{" "}
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
                              <p className="text-lg font-bold text-inventory-green">
                                +{transaction.quantity as number}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item?.unit as string}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                    {(transactions as Array<Record<string, unknown>>).length ===
                      0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Belum ada transaksi barang masuk
                      </p>
                    )}
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

export default StockInPage;
