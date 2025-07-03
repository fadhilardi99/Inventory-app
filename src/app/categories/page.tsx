"use client";
import React, { useState } from "react";
// import { useInventory } from "@/contexts/InventoryContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  List,
  Plus,
  Edit3,
  Trash2,
  FolderOpen,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
// import type { Category } from "@/contexts/InventoryContext";
import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "@/hooks/useCategories";
import { useItemsQuery } from "@/hooks/useItems";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

const CategoriesPage = () => {
  // const { state, addCategory, updateCategory, deleteCategory } = useInventory();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [formData, setFormData] = useState({
    name: "",
  });

  const {
    data: categories = [],
    isLoading,
    isError,
    error,
  } = useCategoriesQuery();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { data: items = [] } = useItemsQuery();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("SUBMIT KATEGORI", { editingCategory, formData });
    if (editingCategory) {
      updateCategory.mutate(
        {
          id: editingCategory.id as string,
          name: formData.name,
        },
        {
          onError: (err) => {
            console.error("UPDATE ERROR", err);
          },
          onSuccess: (data) => {
            console.log("UPDATE SUCCESS", data);
          },
        }
      );
    } else {
      createCategory.mutate(
        {
          name: formData.name,
        },
        {
          onError: (err) => {
            console.error("CREATE ERROR", err);
          },
          onSuccess: (data) => {
            console.log("CREATE SUCCESS", data);
          },
        }
      );
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: "" });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category: Record<string, unknown>) => {
    setEditingCategory(category);
    setFormData({
      name: category.name as string,
    });
    setIsDialogOpen(true);
  };

  const getCategoryItemCount = (categoryId: string) => {
    return items.filter(
      (item: Record<string, unknown>) =>
        (item.categoryId as string) === categoryId
    ).length;
  };

  const getTotalItems = () => {
    return items.length;
  };

  const getTotalCategories = () => {
    return categories.length;
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header ala Items Page */}
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-2 md:px-0 mt-4 mb-10">
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">
                  Kategori Barang
                </h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto md:mx-0">
                  Kelola dan organisasi kategori untuk mengelompokkan barang
                  dengan lebih efisien
                </p>
              </div>
              <div className="flex justify-center md:justify-end mt-4 md:mt-0">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setEditingCategory(null)}
                      className="bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-base font-semibold transition-transform duration-150 hover:scale-105 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    >
                      <FolderOpen className="w-5 h-5 mr-2" />
                      Tambah Kategori
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-semibold text-gray-900">
                        {editingCategory
                          ? "Edit Kategori"
                          : "Tambah Kategori Baru"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700"
                        >
                          Nama Kategori
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Contoh: Elektronik, Alat Tulis, dll"
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          required
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={resetForm}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg"
                          disabled={
                            createCategory.isPending || updateCategory.isPending
                          }
                        >
                          {(createCategory.isPending ||
                            updateCategory.isPending) && (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          )}
                          {editingCategory ? "Update" : "Tambah"}
                        </Button>
                      </div>
                    </form>
                    {(createCategory.isError || updateCategory.isError) && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">
                          {(createCategory.error as Error)?.message ||
                            (updateCategory.error as Error)?.message}
                        </p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto mb-8">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Kategori
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {getTotalCategories()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <List className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Barang
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {getTotalItems()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daftar Kategori */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                Daftar Kategori
              </h2>
              <p className="text-gray-600 mb-4">
                Kelola semua kategori barang Anda
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Memuat kategori...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6 text-center">
                  <p className="text-red-600 font-medium">
                    {(error as Error).message}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Categories Grid */}
            {!isLoading && !isError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {categories.map((category: Record<string, unknown>) => {
                  const itemCount = getCategoryItemCount(category.id as string);
                  return (
                    <Card
                      key={category.id as string}
                      className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {category.name as string}
                            </CardTitle>
                          </div>
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            {itemCount}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-xs text-gray-500 mb-4">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(
                            category.createdAt as string
                          ).toLocaleDateString("id-ID", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex justify-between gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-lg transition-all"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              deleteCategory.mutate(category.id as string)
                            }
                            disabled={itemCount > 0 || deleteCategory.isPending}
                            title={
                              itemCount > 0
                                ? "Tidak dapat menghapus kategori yang masih memiliki barang"
                                : ""
                            }
                            className="flex-1 rounded-lg transition-all"
                          >
                            {deleteCategory.isPending ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3 mr-1" />
                            )}
                            Hapus
                          </Button>
                        </div>
                        {deleteCategory.isError && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-xs">
                              {(deleteCategory.error as Error)?.message}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {categories.length === 0 && !isLoading && !isError && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FolderOpen className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Belum ada kategori
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Mulai dengan menambahkan kategori pertama Anda untuk
                    mengorganisir barang dengan lebih baik
                  </p>
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Tambah Kategori Pertama
                  </Button>
                </CardContent>
              </Card>
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

export default CategoriesPage;
