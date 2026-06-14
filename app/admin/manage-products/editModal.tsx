"use client";

import { useEffect, useState } from "react";
import { useForm, SubmitHandler, FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";

import CustomCheckBox from "@/components/inputs/CustomCheckBox";
import TextArea from "@/components/inputs/TextArea";
import Input from "@/components/inputs/input";
import Button from "@/components/universal/Button";
import Heading from "@/components/universal/Heading";
import { FiTrash, FiUpload } from "react-icons/fi";
import Image from "next/image";
import { colors } from "@/Utils/Colors";
import { X } from "lucide-react";
import Loader from "@/components/universal/Loader";

interface ImageGroup {
  color: string;
  colorCode: string;
  images: string[];
}

interface EditProductModalProps {
  product: any;
  onClose: () => void;
  onUpdate: (updatedProduct: any) => void;
  isOpen: boolean;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  onClose,
  onUpdate,
  isOpen,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  /* ---------------- NORMALIZE PRICE ---------------- */
  const priceString = product.price.replace(/[^\d.-]/g, "");
  const productPrice = Number(priceString);

  /* ---------------- STATE ---------------- */
  const [itemPrice, setItemPrice] = useState<number>(productPrice);
  const [discount, setDiscount] = useState<number>(product.discount ?? 0);
  const [finalPrice, setFinalPrice] = useState<number>(productPrice);

  const [imageGroups, setImageGroups] = useState<ImageGroup[]>(
    product?.imagesByColor && typeof product.imagesByColor === "object"
      ? Object.entries(product.imagesByColor).map(([colorCode, images]) => ({
          colorCode,
          color: getColorName(colorCode),
          images: Array.isArray(images) ? images : [],
        }))
      : [],
  );

  const [selectedColor, setSelectedColor] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  const {
    register,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>();

  function getColorName(hex: string) {
    const colorObj = colors.find(
      (c) => c.colorCode.toLowerCase() === hex.toLowerCase(),
    );
    return colorObj ? colorObj.color : hex;
  }

  /* ---------------- RESET FORM ---------------- */
  useEffect(() => {
    if (isOpen && product) {
      reset({
        name: product.name,
        description: product.description,
        brand: product.brand,
        category: product.category,
        inStock: product.inStock,
        quantity: product.quantity,
        price: productPrice,
        weight: product.weight * 1000,
        discount: product.discount ?? 0,
      });

      setItemPrice(productPrice);
    }
  }, [isOpen, product, reset, productPrice]);

  /* ---------------- SYNC MODAL WHEN PRODUCT CHANGES ---------------- */
  useEffect(() => {
    if (!product) return;

    const normalizedPrice = Number(
      String(product.price).replace(/[^\d.-]/g, ""),
    );

    setItemPrice(normalizedPrice);
    setDiscount(product.discount ?? 0);
    setFinalPrice(product.finalPrice ?? normalizedPrice);

    reset({
      name: product.name,
      description: product.description,
      brand: product.brand,
      category: product.category,
      inStock: product.inStock,
      quantity: product.quantity,
      price: normalizedPrice,
      weight: product.weight * 1000,
      discount: product.discount ?? 0,
    });
  }, [product, reset]);

  /* ---------------- RETAIN DISCOUNT ON OPEN ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    if (discount > 0) {
      const discountAmt = productPrice * (discount / 100);
      setFinalPrice(Number((productPrice - discountAmt).toFixed(2)));
    } else {
      setFinalPrice(productPrice);
    }
  }, [isOpen, discount, productPrice]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        setCategories(response.data.map((cat: any) => cat.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  /* ---------------- IMAGE UPLOAD ---------------- */
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || !selectedColor) {
      toast.error("Please select a color before uploading.");
      return;
    }

    const selectedFiles = Array.from(event.target.files);
    setIsLoading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post("/api/upload-images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedUrls = response.data.urls;

      setImageGroups((prev) => {
        const exists = prev.some((g) => g.color === selectedColor);
        if (exists) {
          return prev.map((g) =>
            g.color === selectedColor
              ? { ...g, images: [...g.images, ...uploadedUrls] }
              : g,
          );
        }

        return [
          ...prev,
          {
            colorCode:
              colors.find((c) => c.color === selectedColor)?.colorCode || "",
            color: selectedColor,
            images: uploadedUrls,
          },
        ];
      });

      toast.success("Images uploaded successfully.");
    } catch {
      toast.error("Failed to upload images.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = (color: string, index: number) => {
    setImageGroups((prev) =>
      prev.map((group) =>
        group.color === color
          ? { ...group, images: group.images.filter((_, i) => i !== index) }
          : group,
      ),
    );
  };

  /* ---------------- SUBMIT ---------------- */
  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    const updatedProduct = {
      ...product,
      ...data,
      price: itemPrice,
      discount,
      finalPrice,
      images: imageGroups,
    };

    // Trigger parent update
    await onUpdate(updatedProduct);
    // console.log("updatedProduct", updatedProduct.discount);
    // Reset modal form with updated data
    reset({
      name: updatedProduct.name,
      description: updatedProduct.description,
      brand: updatedProduct.brand,
      category: updatedProduct.category,
      inStock: updatedProduct.inStock,
      quantity: updatedProduct.quantity,
      price: updatedProduct.price,
      weight: updatedProduct.weight * 1000,
      discount: updatedProduct.discount ?? 0,
    });

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {isLoading && <Loader />}
      <div className="fixed inset-0 z-[1000] flex items-start justify-center bg-black bg-opacity-50 p-4 pt-24 overflow-y-auto">
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-3xl relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>

          <Heading title="Edit Product" center />

          <form className="space-y-4 text-sm" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="name"
              label="Name"
              register={register}
              errors={errors}
              required
            />

            <Input
              id="price"
              label="Price (INR)"
              type="number"
              register={register}
              errors={errors}
              required
              onChange={(e) => {
                const val = Number(e.target.value);
                setItemPrice(val);

                if (discount > 0) {
                  const discountAmt = val * (discount / 100);
                  setFinalPrice(Number((val - discountAmt).toFixed(2)));
                } else {
                  setFinalPrice(val);
                }
              }}
            />

            <Input
              id="quantity"
              label="Quantity"
              type="number"
              register={register}
              errors={errors}
              required
            />
            <Input
              id="brand"
              label="Brand"
              register={register}
              errors={errors}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                {...register("category", { required: true })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm">Category is required</p>
              )}
            </div>

            <Input
              id="weight"
              label="Weight (gram)"
              type="number"
              register={register}
              errors={errors}
              required
            />

            <TextArea
              id="description"
              label="Description"
              register={register}
              errors={errors}
              required
            />

            <Input
              id="discount"
              label="Discount (%)"
              type="number"
              register={register}
              errors={errors}
              onChange={(e) => {
                const val = Number(e.target.value);

                if (!val || val <= 0) {
                  setDiscount(0);
                  setFinalPrice(itemPrice);
                  return;
                }

                setDiscount(val);
                const discountAmt = itemPrice * (val / 100);
                setFinalPrice(Number((itemPrice - discountAmt).toFixed(2)));
              }}
            />

            {/* FINAL PRICE */}
            <div className="text-lg font-semibold">
              Price:{" "}
              {discount > 0 && finalPrice < productPrice ? (
                <>
                  <span className="line-through text-gray-500">
                    ₹{productPrice}
                  </span>{" "}
                  <span className="text-red-500">₹{finalPrice}</span>
                </>
              ) : (
                <span>₹{productPrice}</span>
              )}
            </div>

            <CustomCheckBox
              id="inStock"
              register={register}
              label="Product is in stock"
            />

            {/* Image Section */}
            <div>
              <div className="font-semibold text-sm">
                Product Images by Color
              </div>
              {imageGroups.map((group) => (
                <div key={group.color} className="mt-4">
                  <div className="flex items-center font-semibold text-sm">
                    <span
                      style={{ backgroundColor: group.colorCode }}
                      className="w-4 h-4 rounded-full inline-block mr-2"
                    />
                    {group.color}
                  </div>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {group.images.map((img, i) => (
                      <div
                        key={i}
                        className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt="Product"
                          layout="fill"
                          objectFit="cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                          onClick={() => handleRemoveImage(group.color, i)}
                        >
                          <FiTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Color Picker */}
              <label className="block mt-2 text-sm font-semibold">
                Select Color
              </label>
              <select
                className="w-full border p-2 mt-1 rounded"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                <option value="">Choose a color</option>
                {colors.map((color) => (
                  <option key={color.colorCode} value={color.color}>
                    {color.color}
                  </option>
                ))}
              </select>

              {/* Image Upload */}
              <label className="mt-2 flex items-center justify-center border border-dashed p-2 cursor-pointer text-blue-500 text-sm">
                <FiUpload size={18} />
                <span className="ml-2">Upload Images</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-4">
              <Button lable="Cancel" onClick={onClose} />
              <Button
                lable={isLoading ? "Updating..." : "Update Product"}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditProductModal;
