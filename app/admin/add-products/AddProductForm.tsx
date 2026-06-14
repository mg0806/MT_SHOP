"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import axios from "axios";
import CategoryInput from "@/components/inputs/CategoriesInput";
import { MdStorefront } from "react-icons/md";
import CustomCheckBox from "@/components/inputs/CustomCheckBox";
import TextArea from "@/components/inputs/TextArea";
import Input from "@/components/inputs/input";
import Button from "@/components/universal/Button";
import Heading from "@/components/universal/Heading";
import Loader from "@/components/universal/Loader"; // Import Loader
import ColorPicker from "@/components/inputs/ColorPicker";
import SelectImage from "@/components/inputs/SelectImage";

export type ImageType = {
  color: string;
  colorCode: string;
  images: File[] | null;
};
export type UploadedImageType = {
  color: string;
  colorCode: string;
  images: string[];
};

const AddProductForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<ImageType[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedHex, setSelectedHex] = useState("#E8FF00");
  const [colorName, setColorName] = useState("");
  const [isProductCreated, setIsProductCreated] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("/api/categories");
        const fetchedCategories = response.data.map((cat: any) => ({
          label: cat.name,
          icon: MdStorefront, // Default icon
        }));
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      category: "",
      inStock: false,
      images: [],
      price: "",
      quantity: "",
      weight: "",
      availableSizes: [],
    },
  });

  useEffect(() => {
    setCustomValue("images", images);
  }, [images]);

  useEffect(() => {
    setCustomValue("availableSizes", selectedSizes);
  }, [selectedSizes]);

  useEffect(() => {
    if (isProductCreated) {
      reset();
      setImages([]);
      setSelectedSizes([]);
      setSelectedHex("#E8FF00");
      setColorName("");
      setIsProductCreated(false);
    }
  }, [isProductCreated, reset]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    let uploadedImages: UploadedImageType[] = [];

    if (!data.category) {
      setIsLoading(false);
      return toast.error("Category is not selected");
    }

    if (!data.images || data.images.length === 0) {
      setIsLoading(false);
      return toast.error("No image is selected");
    }

    if (!data.availableSizes || data.availableSizes.length === 0) {
      setIsLoading(false);
      return toast.error("Select at least one product size");
    }

    // Upload images to Cloudinary and store download URLs in MongoDB
    const handleImageUploads = async () => {
      toast("Uploading images, please wait...");

      try {
        for (const item of data.images) {
          if (item.images && item.images.length > 0) {
            const formData = new FormData();
            item.images.forEach((image: File) => {
              formData.append("files", image);
            });

            const response = await axios.post("/api/upload-images", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            const uploadedUrls = response.data.urls;

            uploadedImages.push({
              color: item.color,
              colorCode: item.colorCode,
              images: uploadedUrls,
            });
          }
        }
      } catch (error) {
        setIsLoading(false);
        console.error("Error uploading images", error);
        toast.error("Error uploading images");
        throw error;
      }
    };

    try {
      await handleImageUploads();
    } catch {
      return;
    }

    const productData = { ...data, images: uploadedImages };

    // Add product to the database
    axios
      .post("/api/products", productData)
      .then(() => {
        toast.success("Product Created");
        setIsProductCreated(true);
        router.refresh();
      })
      .catch(() => {
        toast.error("Something went wrong while saving product");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const category = watch("category");
  const productSizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"];

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const addImageToState = useCallback((value: ImageType) => {
    setImages((prev = []) => {
      return prev.some((item) => item.color === value.color)
        ? prev.map((item) =>
            item.color === value.color
              ? {
                  ...item,
                  images: [...(item.images || []), ...(value.images || [])],
                }
              : item,
          )
        : [...prev, { ...value, images: value.images || [] }];
    });
  }, []);

  const removeImageFromState = useCallback(
    (color: string, imageToRemove: File) => {
      setImages((prev) =>
        prev.map((item) =>
          item.color === color
            ? {
                ...item,
                images:
                  item.images?.filter((img) => img !== imageToRemove) || [],
              }
            : item,
        ),
      );
    },
    [],
  );

  const addColorVariant = () => {
    const normalizedHex = selectedHex.toUpperCase();
    const normalizedName = colorName.trim() || normalizedHex;

    if (images.some((item) => item.colorCode.toUpperCase() === normalizedHex)) {
      return toast.error("This color is already added");
    }

    setImages((current) => [
      ...current,
      {
        color: normalizedName,
        colorCode: normalizedHex,
        images: [],
      },
    ]);
    setColorName("");
  };

  const removeColorVariant = (color: string) => {
    setImages((current) => current.filter((item) => item.color !== color));
  };

  const handleColorImageChange = (color: string, selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const fileArray = Array.from(selectedFiles);

    setImages((current) =>
      current.map((item) =>
        item.color === color
          ? {
              ...item,
              images: [...(item.images || []), ...fileArray],
            }
          : item,
      ),
    );
  };

  return (
    <>
      <Heading title="Add Product" center />
      <Input
        id="name"
        label="Name"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="price"
        label="Price"
        disabled={isLoading}
        register={register}
        errors={errors}
        type="number"
        required
      />
      <Input
        id="quantity"
        label="Quantity"
        disabled={isLoading}
        register={register}
        errors={errors}
        type="number"
        required
      />

      <Input
        id="brand"
        label="Brand"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <Input
        id="weight"
        label="Weight (gram)"
        disabled={isLoading}
        register={register}
        errors={errors}
        type="number"
        // step="0.01" // ✅ allows decimal input
        required
      />
      <TextArea
        id="description"
        label="Description"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <CustomCheckBox
        id="inStock"
        register={register}
        label="Product is in stock"
      />

      <div className="w-full font-medium">
        <div className="mb-2 font-semibold">Select a Category</div>
        <div className="grid grid-cols-2 md:grid-cols-3 max-h-[50vh] gap-3 overflow-y-auto">
          {categories.map((item) =>
            item.label === "All" ? null : (
              <CategoryInput
                key={item.label}
                onClick={() => setCustomValue("category", item.label)}
                selected={category === item.label}
                label={item.label}
                icon={item.icon}
              />
            ),
          )}
        </div>
      </div>

      <div className="w-full flex flex-col flex-wrap gap-4">
        <div>
          <div className="font-bold">
            Create product colors and upload images.
          </div>
          <div className="text-sm">
            Pick any HEX color, add it as a product color, then upload images for that color.
          </div>
        </div>

        <div className="grid gap-5 border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <ColorPicker value={selectedHex} onChange={setSelectedHex} />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={colorName}
              onChange={(event) => setColorName(event.target.value)}
              disabled={isLoading}
              placeholder="Color name, e.g. Olive Green"
              className="min-h-14 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm outline-none"
            />
            <button
              type="button"
              onClick={addColorVariant}
              className="min-h-14 bg-[var(--color-accent)] px-6 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-bg)]"
            >
              Add color
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {images.length === 0 ? (
            <div className="border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-secondary)]">
              No product colors added yet.
            </div>
          ) : (
            images.map((item) => (
              <div key={item.color} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="h-9 w-9 border border-[var(--color-border)]" style={{ backgroundColor: item.colorCode }} />
                    <div>
                      <div className="font-black">{item.color}</div>
                      <div className="font-mono text-xs text-[var(--color-secondary)]">{item.colorCode}</div>
                    </div>
                  </div>
                  <Button lable="Remove color" small outline onClick={() => removeColorVariant(item.color)} />
                </div>

                <SelectImage item={item} handleFileChange={(files) => handleColorImageChange(item.color, files)} />

                {item.images && item.images.length > 0 && (
                  <div className="mt-4 grid gap-2">
                    {item.images.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <div className="flex min-w-0 items-center gap-3">
                          {file.type.startsWith("image/") && (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="h-12 w-12 object-cover"
                            />
                          )}
                          <span className="max-w-[220px] truncate">{file.name}</span>
                        </div>
                        <Button
                          lable="Remove"
                          small
                          outline
                          onClick={() => removeImageFromState(item.color, file)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div>
          <div className="font-bold">Select available product sizes.</div>
          <div className="text-sm">These sizes will be shown on product filters and product pages.</div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {productSizes.map((size) => {
            const selected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  setSelectedSizes((current) =>
                    selected ? current.filter((item) => item !== size) : [...current, size],
                  )
                }
                className={`min-h-12 border px-4 text-sm font-black uppercase tracking-[0.12em] transition ${
                  selected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
                    : "border-[var(--color-border)] text-[var(--color-primary)] hover:border-[var(--color-accent)]"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      <Button
        lable={isLoading ? "Processing..." : "Add Product"}
        onClick={handleSubmit(onSubmit)}
        disabled={isLoading}
      />

      {/* Loader Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Loader />
        </div>
      )}
    </>
  );
};

export default AddProductForm;
