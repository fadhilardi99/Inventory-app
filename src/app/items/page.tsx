"use client";
import React, { useState } from "react";
// import { useInventory } from "@/contexts/InventoryContext";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          <div className="mb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <Input
                placeholder="Cari kode/nama barang..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 border border-slate-300 rounded focus:border-indigo-400 focus:ring-0 text-base"
              />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-full md:w-48 border border-slate-300 rounded focus:border-indigo-400 focus:ring-0 text-base">
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
                className={`border border-slate-300 rounded px-4 py-2 text-base ${
                  filterLowStock
                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                    : "bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                Stok Rendah
              </Button>
            </div>
          </div>

          {/* Items List */}
          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 rounded-xl shadow-md text-base overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-500 to-violet-600 shadow">
                  <th className="py-4 px-4 text-left font-bold uppercase text-slate-100 text-lg">
                    Nama Barang
                  </th>
                  <th className="py-4 px-4 text-right font-bold uppercase text-slate-100 text-lg">
                    Stok
                  </th>
                  <th className="py-4 px-4 text-left font-bold uppercase text-slate-100 text-lg">
                    Satuan
                  </th>
                  <th className="py-4 px-4 text-left font-bold uppercase text-slate-100 text-lg hidden md:table-cell">
                    Lokasi
                  </th>
                  <th className="py-4 px-4 text-right font-bold uppercase text-slate-100 text-lg hidden md:table-cell">
                    Stok Min
                  </th>
                  <th className="py-4 px-4 text-center font-bold uppercase text-slate-100 text-lg hidden md:table-cell">
                    Status
                  </th>
                  <th className="py-4 px-4 text-center font-bold uppercase text-slate-100 text-lg">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map(
                  (item: Record<string, unknown>, idx: number) => {
                    const stockStatus = getStockStatus(item);
                    const category =
                      (categories.find(
                        (cat: Record<string, unknown>) =>
                          cat.id === item.categoryId
                      )?.name as string) || "-";
                    // Icon kategori (contoh: ambil huruf depan atau emoji default)
                    const categoryIcon = category !== "-" ? "📦" : "📁";
                    // Status text
                    const statusText =
                      stockStatus === "low"
                        ? "Stok Rendah"
                        : stockStatus === "high"
                        ? "Stok Melimpah"
                        : "Stok Normal";
                    return (
                      <tr
                        key={item.id as string}
                        className={`${
                          idx % 2 === 1 ? "bg-slate-50" : "bg-white"
                        } border-b border-slate-200 hover:bg-indigo-50 transition-colors`}
                      >
                        {/* Nama Barang, Kode, Kategori */}
                        <td className="py-2 px-4 min-w-[180px] align-top">
                          <div className="font-semibold text-base text-slate-800 flex items-center gap-2">
                            {item.name as string}
                          </div>
                          <div className="text-xs text-slate-500">
                            Kode: {item.code as string}
                          </div>
                          <div className="mt-1 flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 rounded px-2 py-0.5 text-xs font-medium">
                              <span>{categoryIcon}</span> {category}
                            </span>
                          </div>
                        </td>
                        {/* Stok */}
                        <td className="py-2 px-4 text-right align-middle">
                          <span className="text-base font-bold text-indigo-700 flex items-center gap-2 justify-end">
                            {item.stock as number}
                          </span>
                        </td>
                        {/* Satuan */}
                        <td className="py-2 px-4 align-middle text-slate-800">
                          {item.unit as string}
                        </td>
                        {/* Lokasi */}
                        <td className="py-2 px-4 hidden md:table-cell align-middle text-slate-800">
                          {item.location as string}
                        </td>
                        {/* Stok Min */}
                        <td className="py-2 px-4 text-right hidden md:table-cell align-middle text-slate-800">
                          {item.minStock as number}
                        </td>
                        {/* Status */}
                        <td className="py-2 px-4 text-center hidden md:table-cell align-middle">
                          <span className="text-xs text-slate-700">
                            {statusText}
                          </span>
                        </td>
                        {/* Aksi */}
                        <td className="py-2 px-4 text-center align-middle">
                          <div className="flex gap-4 justify-center items-center">
                            <Button
                              onClick={() => handleEdit(item)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow-sm transition-colors"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() =>
                                deleteItem.mutate(item.id as string)
                              }
                              disabled={deleteItem.isPending}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded shadow-sm transition-colors"
                            >
                              Hapus
                            </Button>
                          </div>
                          {deleteItem.isError && (
                            <p className="text-red-500 text-xs mt-1">
                              {(deleteItem.error as Error)?.message}
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
                {paginatedItems.length === 0 && !isLoading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center text-muted-foreground bg-indigo-50"
                    >
                      <Archive className="w-20 h-20 mx-auto mb-6 text-indigo-200" />
                      <div className="text-xl font-semibold mb-2 text-indigo-700">
                        Belum ada barang ditemukan
                      </div>
                      <div className="text-base text-indigo-600">
                        Coba tambah barang baru atau ubah filter pencarian.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
                <div className="text-sm text-muted-foreground">
                  Menampilkan{" "}
                  {filteredItems.length === 0
                    ? 0
                    : (currentPage - 1) * itemsPerPage + 1}
                  –{Math.min(currentPage * itemsPerPage, filteredItems.length)}{" "}
                  dari {filteredItems.length} barang
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Sebelumnya
                  </Button>
                  <span className="text-sm px-2 py-1">
                    Halaman {currentPage} / {totalPages}
                  </span>
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
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ItemsPage;
