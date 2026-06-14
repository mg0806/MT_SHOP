"use client";
import { Product, Review, Order } from "@prisma/client";
import { SafeUser } from "@/types";
import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Heading from "@/components/universal/Heading";
import Input from "@/components/inputs/input";
import Button from "@/components/universal/Button";
import toast from "react-hot-toast";
import axios from "axios";
import { JsonArray } from "@prisma/client/runtime/library";
import { FaStar } from "react-icons/fa";

interface AddRatingProps {
  product: Product & {
    reviews: Review[];
  };
  user:
    | (SafeUser & {
        orders: Order[];
      })
    | null;
}

const AddRating: React.FC<AddRatingProps> = ({ product, user }) => {
  const [isLoading, setIsLodaing] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      comment: "",
      rating: 0,
    },
  });

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLodaing(true);
    if (data.rating === 0) {
      setIsLodaing(false);
      return toast.error(" Please Select Rating");
    }
    const ratingData = {
      ...data,
      photos: photoUrls,
      userId: user?.id,
      product: product,
    };
    // console.log(ratingData);
    axios
      .post("/api/rating", ratingData)
      .then(() => {
        toast.success("Rating Submitted");
        router.refresh();
        reset();
      })
      .catch((error) => {
        // console.log("error", error);
        toast.error("Something went wrong");
      })
      .finally(() => {
        setIsLodaing(false);
      });
  };

  if (!user || !product) {
    return null;
  }

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    setUploadingPhotos(true);
    try {
      const res = await fetch("/api/review-photos", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Photo upload failed");
      setPhotoUrls((prev) => [...prev, ...data.urls]);
      toast.success("Review photos uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Photo upload failed");
    } finally {
      setUploadingPhotos(false);
    }
  };

  const deliveredOrder = user?.orders.some((order) => {
    const products = order.products as JsonArray | null; // Assert products as JsonArray (or null)

    if (Array.isArray(products)) {
      // Check if each product is an object and has the 'id' property
      return products.some((item) => {
        if (item && typeof item === "object") {
          const itemProductId = "productId" in item ? item.productId : "id" in item ? item.id : null;
          return itemProductId === product.id && order.deliveryStatus === "delivered";
        }
        return false;
      });
    }

    return false; // If products is not an array or doesn't contain valid items, return false
  });

  const userReview = product?.reviews.find((review: Review) => {
    return review.userId === user.id;
  });

  const startEditReview = () => {
    if (!userReview) return;
    setIsEditingReview(true);
    setSelectedRating(userReview.rating);
    setPhotoUrls(Array.isArray(userReview.photos) ? (userReview.photos as string[]) : []);
    setCustomValue("rating", userReview.rating);
    setCustomValue("comment", userReview.comment);
  };

  const onUpdate: SubmitHandler<FieldValues> = async (data) => {
    if (!userReview) return;
    setIsLodaing(true);
    if (data.rating === 0) {
      setIsLodaing(false);
      return toast.error("Please select rating");
    }

    try {
      await axios.put("/api/rating", {
        reviewId: userReview.id,
        comment: data.comment,
        rating: data.rating,
        photos: photoUrls,
      });
      toast.success("Review updated");
      setIsEditingReview(false);
      router.refresh();
    } catch (error) {
      toast.error("Unable to update review");
    } finally {
      setIsLodaing(false);
    }
  };

  if (userReview) {
    if (isEditingReview) {
      return (
        <section id="write-review" className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
          <p className="fashion-kicker">Edit Review</p>
          <h2 className="mt-2 text-2xl font-black uppercase text-[var(--color-primary)]">Update your review</h2>
          <div className="mt-4 grid gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setSelectedRating(rating);
                    setCustomValue("rating", rating);
                  }}
                  className="grid h-11 w-11 place-items-center border border-[var(--color-border)] bg-[var(--color-muted)] shadow-sm transition hover:border-[var(--color-accent)]"
                  aria-label={`${rating} star rating`}
                >
                  <FaStar
                    size={20}
                    className={rating <= selectedRating ? "text-[var(--color-accent)]" : "text-[var(--color-border)]"}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                {selectedRating}/5 selected
              </span>
            </div>
            <Input
              id="comment"
              label="Comment"
              disabled={isLoading}
              register={register}
              errors={errors}
              required
            />
            <label className="block border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] p-4 text-sm">
              <span className="font-black uppercase tracking-[0.12em]">
                {uploadingPhotos ? "Uploading..." : "Upload more review photos"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isLoading || uploadingPhotos}
                onChange={handlePhotoUpload}
                className="mt-3 block w-full text-sm"
              />
            </label>
            {photoUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-[var(--color-secondary)]">
                {photoUrls.map((url, index) => (
                  <span key={url} className="border border-[var(--color-border)] px-2 py-1">
                    Photo {index + 1}
                  </span>
                ))}
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button lable={isLoading ? "Saving..." : "Save Review"} onClick={handleSubmit(onUpdate)} />
              <Button lable="Cancel" outline onClick={() => setIsEditingReview(false)} />
            </div>
          </div>
        </section>
      );
    }

    return (
      <section id="write-review" className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
        <p className="fashion-kicker">Your Review</p>
        <h2 className="mt-2 text-2xl font-black uppercase text-[var(--color-primary)]">Review submitted</h2>
        <p className="mt-3 text-sm text-[var(--color-secondary)]">
          You have already reviewed this product. Thank you for sharing your fit feedback.
        </p>
        <div className="mt-4 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <FaStar
              key={rating}
              size={18}
              className={rating <= userReview.rating ? "text-[var(--color-accent)]" : "text-[var(--color-border)]"}
            />
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-[var(--color-primary)]">{userReview.comment}</p>
        <button
          onClick={startEditReview}
          className="mt-5 bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)]"
        >
          Edit Review
        </button>
      </section>
    );
  }

  if (!deliveredOrder) {
    return (
      <section id="write-review" className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
        <p className="fashion-kicker">Write a Review</p>
        <h2 className="mt-2 text-2xl font-black uppercase text-[var(--color-primary)]">Review unlocks after delivery</h2>
        <p className="mt-3 text-sm text-[var(--color-secondary)]">
          You can rate and review this product once an order containing it is successfully delivered.
        </p>
        <button
          disabled
          className="mt-5 border border-[var(--color-border)] bg-[var(--color-muted)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]"
        >
          Awaiting delivery
        </button>
      </section>
    );
  }

  return (
    <section id="write-review" className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
      <div className="grid gap-4">
        <div>
          <p className="fashion-kicker">Verified Purchase</p>
          <Heading title="Rate this product" />
          <p className="mt-2 text-sm text-[var(--color-secondary)]">
            Share fit, quality, and comfort feedback after delivery.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                disabled={isLoading}
                onClick={() => {
                  setSelectedRating(rating);
                  setCustomValue("rating", rating);
                }}
                className="grid h-11 w-11 place-items-center border border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-border)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                aria-label={`${rating} star rating`}
              >
                <FaStar
                  size={20}
                  className={rating <= selectedRating ? "text-[var(--color-accent)]" : "text-[var(--color-border)]"}
                />
              </button>
            ))}
            <span className="ml-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
              {selectedRating ? `${selectedRating}/5 selected` : "Select rating"}
            </span>
          </div>

      <div className="w-full">
        <Input
          id="comment"
          label="Comment"
          disabled={isLoading}
          register={register}
          errors={errors}
          required
        />
      </div>
      <div className="w-full">
        <label className="block border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] p-4 text-sm">
          <span className="font-black uppercase tracking-[0.12em]">
            {uploadingPhotos ? "Uploading..." : "Upload review photos"}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={isLoading || uploadingPhotos}
            onChange={handlePhotoUpload}
            className="mt-3 block w-full text-sm"
          />
        </label>
        {photoUrls.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--color-secondary)]">
            {photoUrls.map((url, index) => (
              <span key={url} className="border border-[var(--color-border)] px-2 py-1">
                Photo {index + 1}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="w-full">
        <Button
          lable={isLoading ? "Loading" : "Rate Product"}
          onClick={handleSubmit(onSubmit)}
        />
      </div>
        </div>
      </div>
    </section>
  );
};

export default AddRating;
