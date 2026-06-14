"use client";

import { useState, useCallback } from "react";
import { Product } from "@prisma/client";
import { formatPrice } from "@/Utils/formatPrice";
import Heading from "@/components/universal/Heading";
import Status from "@/components/Status";
import {
  MdCached,
  MdClose,
  MdDelete,
  MdDone,
  MdRemoveRedEye,
  MdStar,
} from "react-icons/md";
import ActionBtn from "@/components/ActionBtn";
import Button from "@/components/universal/Button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import EditProductModal from "./editModal";
import Loader from "@/components/universal/Loader";

interface ManageProductClientProps {
  products: Product[];
}

const ManageProductsClient: React.FC<ManageProductClientProps> = ({
  products,
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectionModel, setSelectionModel] = useState<string[]>([]);
  const [bulkDiscount, setBulkDiscount] = useState<number>(0);

  let rows = products.map((product) => {
    // Ensure images is an array before accessing it
    const parsedImages = Array.isArray(product.images)
      ? (product.images as Array<{
          color: string;
          colorCode: string;
          images: string[];
        }>)
      : [];

    return {
      id: product.id,
      name: product.name,
      price: formatPrice(product.price),
      quantity: product.quantity,
      category: product.category,
      brand: product.brand,
      description: product.description,
      inStock: product.inStock,
      isNewArrival: product.isNewArrival ?? false,
      weight: product.weight,
      finalPrice: product.finalPrice,
      discount: product.discount ?? 0,
      images: parsedImages,
      // Store images grouped by colorCode
      imagesByColor: parsedImages.reduce(
        (acc, variant) => {
          acc[variant.colorCode] = variant.images;
          return acc;
        },
        {} as Record<string, string[]>,
      ), // Object where keys are color codes
    };
  });

  const handleToggleStock = useCallback(
    (id: string, inStock: boolean) => {
      setLoading(true);
      axios
        .put("/api/products", { id, inStock: !inStock })
        .then(() => {
          toast.success("Product Status updated");
          router.refresh();
          setLoading(false);
        })
        .catch(() => toast.error("Something went wrong"));
    },
    [router],
  );

  const handleToggleNewArrival = useCallback(
    (id: string, isNewArrival: boolean) => {
      setLoading(true);
      axios
        .put("/api/products", { id, isNewArrival: !isNewArrival })
        .then(() => {
          toast.success(!isNewArrival ? "Added to New Arrivals" : "Removed from New Arrivals");
          router.refresh();
        })
        .catch(() => toast.error("Something went wrong"))
        .finally(() => setLoading(false));
    },
    [router],
  );

  const handleDelete = useCallback(
    async (id: string, images: any[]) => {
      setLoading(true);
      toast("Deleting product, please wait");

      try {
        // Collect all image URLs to delete
        const allImageUrls: string[] = [];
        for (const item of images) {
          if (item.images && Array.isArray(item.images)) {
            allImageUrls.push(...item.images);
          }
        }

        if (allImageUrls.length > 0) {
          await axios.post("/api/delete-images", { urls: allImageUrls });
        }

        await axios.delete(`/api/products/${id}`);
        toast.success("Product Deleted");
        router.refresh();
      } catch (err) {
        console.error("Error deleting product", err);
        toast.error("Error deleting product");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  // ✅ Fix: Ensure selectedProduct is fully populated
  const handleEdit = (product: Product) => {
    // console.log("handel edit", product?.discount);
    setSelectedProduct({ ...product }); // Use a shallow copy to avoid unintended state mutations
    // console.log("selectedProduct", selectedProduct?.discount);
    setOpenModal(true);
  };

  // ✅ Fix: Ensure updatedProduct updates the state correctly
  const handleUpdate = async (updatedProduct: Product) => {
    setLoading(true);
    if (!updatedProduct) return;
    axios
      .put(`/api/products/${updatedProduct.id}`, updatedProduct)
      .then(() => {
        toast.success("Product updated successfully");
        setOpenModal(false);
        setLoading(false);
        router.refresh();
      })
      .catch(() => toast.error("Failed to update product"));
  };

  const handleApplyBulkDiscount = useCallback(async () => {
    if (selectionModel.length === 0) {
      toast.error("Select products to apply the discount first.");
      return;
    }

    if (bulkDiscount < 0 || bulkDiscount > 100) {
      toast.error("Discount must be between 0 and 100.");
      return;
    }

    setLoading(true);

    try {
      await axios.put("/api/products", {
        ids: selectionModel,
        discount: bulkDiscount,
      });
      toast.success(
        `Applied ${bulkDiscount}% discount to ${selectionModel.length} product(s)`,
      );
      setBulkDiscount(0);
      router.refresh();
    } catch (error) {
      console.error("Bulk discount error", error);
      toast.error("Failed to apply bulk discount");
    } finally {
      setLoading(false);
    }
  }, [bulkDiscount, router, selectionModel]);

  const allSelected = rows.length > 0 && selectionModel.length === rows.length;
  const toggleAll = () => {
    setSelectionModel(allSelected ? [] : rows.map((row) => row.id));
  };
  const toggleRow = (id: string) => {
    setSelectionModel((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <div className="m-auto max-w-[1150px] px-4 py-8">
      {loading && <Loader />}

      <Heading title="Manage Products" center />
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Selected:</span>
          <span className="text-slate-700">{selectionModel.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={bulkDiscount}
            onChange={(event) => setBulkDiscount(Number(event.target.value))}
            min={0}
            max={100}
            placeholder="Discount %"
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
          />
          <Button
            lable="Apply Bulk Discount"
            disabled={selectionModel.length === 0 || loading}
            onClick={handleApplyBulkDiscount}
          />
        </div>
      </div>
      <div className="overflow-x-auto border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[980px] border-collapse text-sm text-[var(--color-primary)]">
          <thead className="bg-[var(--color-surface-2)]">
            <tr className="border-b border-[var(--color-border)]">
              <th className="w-12 px-4 py-4 text-left">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              </th>
              {["ID", "Name", "Price(INR)", "Category", "Brand", "Stock Status", "New Arrival", "Action"].map((heading) => (
                <th key={heading} className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-14 text-center font-semibold text-[var(--color-secondary)]">
                  No products found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-2)]">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectionModel.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                  <td className="max-w-[180px] px-4 py-4 font-mono text-xs text-[var(--color-secondary)]">
                    {row.id}
                  </td>
                  <td className="px-4 py-4 font-semibold">{row.name}</td>
                  <td className="px-4 py-4 font-black">{row.price}</td>
                  <td className="px-4 py-4">{row.category || "-"}</td>
                  <td className="px-4 py-4">{row.brand || "-"}</td>
                  <td className="px-4 py-4">
                    <Status
                      text={row.inStock ? "In Stock" : "Out of Stock"}
                      icon={row.inStock ? MdDone : MdClose}
                      bg={row.inStock ? "bg-teal-200" : "bg-rose-200"}
                      color={row.inStock ? "text-teal-700" : "text-rose-700"}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <Status
                      text={row.isNewArrival ? "Yes" : "No"}
                      icon={row.isNewArrival ? MdStar : MdClose}
                      bg={row.isNewArrival ? "bg-yellow-200" : "bg-slate-200"}
                      color={row.isNewArrival ? "text-yellow-800" : "text-slate-700"}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      <ActionBtn icon={MdCached} onClick={() => handleToggleStock(row.id, row.inStock)} />
                      <ActionBtn icon={MdStar} onClick={() => handleToggleNewArrival(row.id, row.isNewArrival)} />
                      <ActionBtn icon={MdDelete} onClick={() => handleDelete(row.id, row.images ?? [])} />
                      <ActionBtn icon={MdRemoveRedEye} onClick={() => handleEdit(row as any)} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {openModal && selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ManageProductsClient;
