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
import { List } from "lucide-react";
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

  return (
    <>
      <SignedIn>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Kategori Barang</h1>
              <p className="text-muted-foreground mt-2">
                Kelola kategori untuk mengelompokkan barang
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => setEditingCategory(null)}
                  className="bg-inventory-blue hover:bg-inventory-blue/90"
                >
                  <List className="w-4 h-4 mr-2" />
                  Tambah Kategori
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Kategori</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Contoh: Elektronik, Alat Tulis, dll"
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="bg-inventory-blue hover:bg-inventory-blue/90"
                      disabled={
                        createCategory.isPending || updateCategory.isPending
                      }
                    >
                      {editingCategory ? "Update" : "Tambah"}
                    </Button>
                  </div>
                </form>
                {(createCategory.isError || updateCategory.isError) && (
                  <p className="text-red-500 text-sm mt-2">
                    {(createCategory.error as Error)?.message ||
                      (updateCategory.error as Error)?.message}
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

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: Record<string, unknown>) => {
              const itemCount = getCategoryItemCount(category.id as string);
              return (
                <Card
                  key={category.id as string}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {category.name as string}
                        </CardTitle>
                      </div>
                      <div className="bg-inventory-blue text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {itemCount}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground mb-4">
                      Dibuat:{" "}
                      {new Date(category.createdAt as string).toLocaleString()}
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
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
                      >
                        Hapus
                      </Button>
                    </div>
                    {deleteCategory.isError && (
                      <p className="text-red-500 text-xs mt-2">
                        {(deleteCategory.error as Error)?.message}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {categories.length === 0 && !isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <List className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Belum ada kategori yang ditambahkan
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

export default CategoriesPage;
