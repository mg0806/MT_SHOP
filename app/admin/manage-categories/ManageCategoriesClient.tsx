"use client";

import { useState, useCallback } from "react";
import { Category } from "@prisma/client";
import Heading from "@/components/universal/Heading";
import {
  MdCached,
  MdClose,
  MdDelete,
  MdDone,
  MdEdit,
  MdAdd,
  MdImage,
} from "react-icons/md";
import ActionBtn from "@/components/ActionBtn";
import Button from "@/components/universal/Button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loader from "@/components/universal/Loader";
import IconPicker from "@/components/admin/IconPicker";
import { getCategoryIcon } from "@/Utils/categoryIconMap";

interface ManageCategoriesClientProps {
  categories: Category[];
}

const ManageCategoriesClient: React.FC<ManageCategoriesClientProps> = ({
  categories,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("FaStore");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [iconPickerMode, setIconPickerMode] = useState<"add" | "edit">("add");

  const rows = categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: (category as any).icon || "FaStore",
    createdAt: category.createdAt.toDateString(),
  }));

  const handleEdit = useCallback((id: string, name: string, icon: string) => {
    setEditingId(id);
    setEditName(name);
    setEditIcon(icon || "FaStore");
  }, []);

  const handleSaveEdit = useCallback(
    async (id: string) => {
      if (!editName.trim()) {
        toast.error("Category name cannot be empty");
        return;
      }
      setLoading(true);
      try {
        await axios.put(`/api/categories/${id}`, {
          name: editName.trim(),
          icon: editIcon,
        });
        toast.success("Category updated");
        router.refresh();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
        setEditingId(null);
        setEditName("");
        setEditIcon("");
      }
    },
    [editName, editIcon, router],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName("");
    setEditIcon("");
  }, []);

  const handleDelete = useCallback(
    async (id: string, name: string) => {
      // First check if products exist
      setLoading(true);
      try {
        const response = await axios.delete(`/api/categories/${id}`);
        toast.success("Category deleted");
        router.refresh();
      } catch (error: any) {
        if (
          error.response?.status === 400 &&
          error.response.data.productsCount
        ) {
          // Show confirmation dialog
          const confirmDelete = window.confirm(
            `${error.response.data.message}\n\nDo you want to continue and delete all products in this category?`,
          );
          if (confirmDelete) {
            // Force delete
            try {
              await axios.delete(`/api/categories/${id}?force=true`);
              toast.success("Category and all products deleted");
              router.refresh();
            } catch (forceError: any) {
              toast.error(
                forceError.response?.data?.message || "Failed to delete",
              );
            }
          }
        } else {
          toast.error(error.response?.data?.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const handleAddCategory = useCallback(async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/categories", {
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
      });
      toast.success("Category added");
      router.refresh();
      setNewCategoryName("");
      setNewCategoryIcon("FaStore");
      setShowAddForm(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [newCategoryName, newCategoryIcon, router]);

  return (
    <div className="mx-auto max-w-[1150px] px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="md:flex-1">
          <Heading title="Manage Categories" center />
        </div>
        <Button
          lable={showAddForm ? "Cancel" : "Add Category"}
          onClick={() => setShowAddForm(!showAddForm)}
          icon={showAddForm ? MdClose : MdAdd}
        />
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 border rounded">
          <div className="flex gap-2 flex-col">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="border px-2 py-1 flex-1"
              />
              <button
                onClick={() => {
                  setIconPickerMode("add");
                  setShowIconPicker(true);
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center gap-1"
              >
                <MdImage /> Pick Icon
              </button>
              <Button lable="Add" onClick={handleAddCategory} />
            </div>
            {newCategoryIcon && (
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <span>Selected Icon:</span>
                {(() => {
                  const Icon = getCategoryIcon(newCategoryIcon);
                  return Icon ? (
                    <Icon className="text-xl" />
                  ) : (
                    <span>{newCategoryIcon}</span>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[720px] border-collapse text-sm text-[var(--color-primary)]">
          <thead className="bg-[var(--color-surface-2)]">
            <tr className="border-b border-[var(--color-border)]">
              {["Icon", "Category Name", "Created At", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-14 text-center text-sm font-semibold text-[var(--color-secondary)]"
                >
                  No categories found
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const IconComponent = getCategoryIcon(row.icon);
                const isEditing = editingId === row.id;

                return (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--color-border)] transition last:border-b-0 hover:bg-[var(--color-surface-2)]"
                  >
                    <td className="w-24 px-4 py-4 align-top">
                      {IconComponent ? (
                        <IconComponent className="text-2xl" />
                      ) : (
                        <span className="text-xs text-[var(--color-secondary)]">No icon</span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      {isEditing ? (
                        <div className="grid gap-3">
                          <input
                            type="text"
                            value={editName}
                            onChange={(event) => setEditName(event.target.value)}
                            className="min-h-11 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm"
                            autoFocus
                          />
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => {
                                setIconPickerMode("edit");
                                setShowIconPicker(true);
                              }}
                              className="inline-flex min-h-10 items-center gap-2 bg-[var(--color-accent)] px-3 text-xs font-black uppercase tracking-[0.1em] text-[var(--color-bg)]"
                            >
                              <MdImage /> Pick Icon
                            </button>
                            <ActionBtn icon={MdDone} onClick={() => handleSaveEdit(row.id)} />
                            <ActionBtn icon={MdClose} onClick={handleCancelEdit} />
                          </div>
                          {editIcon && (
                            <p className="text-xs text-[var(--color-secondary)]">
                              Selected: {editIcon}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="font-semibold">{row.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top text-[var(--color-secondary)]">
                      {row.createdAt}
                    </td>
                    <td className="w-36 px-4 py-4 align-top">
                      <div className="flex gap-2">
                        <ActionBtn
                          icon={MdEdit}
                          onClick={() => handleEdit(row.id, row.name, row.icon)}
                        />
                        <ActionBtn
                          icon={MdDelete}
                          onClick={() => handleDelete(row.id, row.name)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <IconPicker
        selectedIcon={iconPickerMode === "add" ? newCategoryIcon : editIcon}
        onSelectIcon={(iconName) => {
          if (iconPickerMode === "add") {
            setNewCategoryIcon(iconName);
          } else {
            setEditIcon(iconName);
          }
        }}
        isOpen={showIconPicker}
        onClose={() => setShowIconPicker(false)}
      />

      {loading && <Loader />}
    </div>
  );
};

export default ManageCategoriesClient;
