"use client";
import React, { useState } from "react";
// import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Archive } from "lucide-react";
// import type { Item } from "@/contexts/InventoryContext";
import {
  useItemsQuery,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from "@/hooks/useItems";
import { useCategoriesQuery } from "@/hooks/useCategories";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

const ItemsPage = () => {
  // const { state, addItem, updateItem, deleteItem, getCategoryName } = useInventory();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    categoryId: "",
    stock: 0,
    unit: "",
    location: "",
    minStock: 0,
  });

  const { data: items = [], isLoading, isError, error } = useItemsQuery();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();
  const deleteItem = useDeleteItem();
  const { data: categories = [] } = useCategoriesQuery();

  const filteredItems = items.filter((item: Record<string, unknown>) => {
    const matchesSearch =
      (item.name as string)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.code as string)?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" ||
      (item.categoryId as string) === filterCategory;
    const matchesLowStock =
      !filterLowStock || (item.stock as number) <= (item.minStock as number);
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      updateItem.mutate({
        ...formData,
        id: editingItem.id as string,
      });
    } else {
      createItem.mutate(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      categoryId: "",
      stock: 0,
      unit: "",
      location: "",
      minStock: 0,
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setEditingItem(item);
    setFormData({
      code: item.code as string,
      name: item.name as string,
      categoryId: item.categoryId as string,
      stock: item.stock as number,
      unit: item.unit as string,
      location: item.location as string,
      minStock: item.minStock as number,
    });
    setIsDialogOpen(true);
  };

  const getStockStatus = (item: Record<string, unknown>) => {
    if ((item.stock as number) <= (item.minStock as number)) return "low";
    if ((item.stock as number) > (item.minStock as number) * 3) return "high";
    return "normal";
  };

  return (
    <>
      <SignedIn>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Manajemen Barang</h1>
              <p className="text-muted-foreground mt-2">
                Kelola semua barang dalam inventory
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingItem(null)}
                  className="bg-inventory-blue hover:bg-inventory-blue/90"
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Tambah Barang
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Edit Barang" : "Tambah Barang Baru"}
                  </DialogTitle>
                  {!editingItem && (
                    <p className="text-sm text-muted-foreground">
                      Stok awal akan otomatis dicatat sebagai transaksi Stock In
                    </p>
                  )}
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="code">Kode Barang</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({ ...formData, code: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="name">Nama Barang</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Kategori</Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, categoryId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: Record<string, unknown>) => (
                          <SelectItem
                            key={category.id as string}
                            value={category.id as string}
                          >
                            {category.name as string}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock">Stok Awal</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="0"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Stok awal akan otomatis menjadi transaksi Stock In
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="unit">Satuan</Label>
                      <Input
                        id="unit"
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        placeholder="pcs, kg, liter, dll"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Lokasi</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        placeholder="Gudang, Rak, dll"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minStock">Stok Minimum</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minStock: parseInt(e.target.value) || 0,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="bg-inventory-blue hover:bg-inventory-blue/90"
                      disabled={createItem.isPending || updateItem.isPending}
                    >
                      {editingItem ? "Update" : "Tambah"}
                    </Button>
                  </div>
                </form>
                {(createItem.isError || updateItem.isError) && (
                  <p className="text-red-500 text-sm mt-2">
                    {(createItem.error as Error)?.message ||
                      (updateItem.error as Error)?.message}
                  </p>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* Loading & Error State */}
          {isLoading && <p>Loading...</p>}
          {isError && (
            <p className="text-red-500">{(error as Error).message}</p>
          )}

          {/* Filter & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Cari kode/nama barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((category: Record<string, unknown>) => (
                    <SelectItem
                      key={category.id as string}
                      value={category.id as string}
                    >
                      {category.name as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={filterLowStock ? "default" : "outline"}
                onClick={() => setFilterLowStock((v) => !v)}
              >
                Stok Rendah
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item: Record<string, unknown>) => {
              const stockStatus = getStockStatus(item);
              return (
                <Card
                  key={item.id as string}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl mb-2">
                      {item.name as string}
                    </CardTitle>
                    <Badge
                      variant={
                        stockStatus === "low"
                          ? "destructive"
                          : stockStatus === "high"
                          ? "default"
                          : "outline"
                      }
                      className={
                        stockStatus === "low"
                          ? "bg-red-500 text-white"
                          : stockStatus === "high"
                          ? "bg-green-500 text-white"
                          : ""
                      }
                    >
                      {stockStatus === "low"
                        ? "Stok Rendah"
                        : stockStatus === "high"
                        ? "Stok Melimpah"
                        : "Stok Normal"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground mb-2">
                      Kode: {item.code as string} • Kategori:{" "}
                      {(categories.find(
                        (cat: Record<string, unknown>) =>
                          cat.id === item.categoryId
                      )?.name as string) || "-"}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      Dibuat:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt as string).toLocaleString(
                            "id-ID",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "-"}
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                      <span>
                        Stok: <b>{item.stock as number}</b>{" "}
                        {item.unit as string}
                      </span>
                      <span>Lokasi: {item.location as string}</span>
                      <span>Stok Minimum: {item.minStock as number}</span>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItem.mutate(item.id as string)}
                        disabled={deleteItem.isPending}
                      >
                        Hapus
                      </Button>
                    </div>
                    {deleteItem.isError && (
                      <p className="text-red-500 text-xs mt-2">
                        {(deleteItem.error as Error)?.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredItems.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Tidak ada barang ditemukan
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ItemsPage;
