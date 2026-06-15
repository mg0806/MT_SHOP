"use client";

import { formatPrice } from "@/Utils/formatPrice";
import { truncateText } from "@/Utils/truncateText";
import { useWishlist } from "@/hooks/useWishlist";
import { Rating } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import Loader from "../universal/Loader";

interface ProductsCardProps {
  data: any;
}

const getCardImageUrl = (src: string) => {
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return src;
  }

  return src.replace(
    "/image/upload/",
    "/image/upload/f_auto,q_auto,e_trim:10,c_fill,g_auto,w_900,h_1125/",
  );
};

const ProductCard: React.FC<ProductsCardProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();

  const reviews = data.reviews || [];
  const productRating =
    reviews.length > 0
      ? reviews.reduce((acc: number, item: any) => item.rating + acc, 0) / reviews.length
      : 0;
  const productImage =
    data.images?.[0]?.images?.[0] ?? data.images?.[0]?.image ?? "/next.svg";
  const hoverImage =
    data.images?.[0]?.images?.[1] ??
    data.images?.[1]?.image ??
    data.images?.[1]?.images?.[0] ??
    productImage;
  const cardProductImage = getCardImageUrl(productImage);
  const cardHoverImage = getCardImageUrl(hoverImage);
  const hasSalePrice =
    typeof data.finalPrice === "number" &&
    data.finalPrice > 0 &&
    data.finalPrice < data.price;
  const displayPrice = hasSalePrice ? data.finalPrice : data.price;
  const discount = hasSalePrice
    ? Math.round(((data.price - data.finalPrice) / data.price) * 100)
    : 0;
  const displaySizes = Array.isArray(data.availableSizes) && data.availableSizes.length > 0
    ? data.availableSizes
    : ["S", "M", "L", "XL"];

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/product/${data.id}`);
    }, 350);
  };

  return (
    <div
      onClick={!loading ? handleClick : undefined}
      className={`group relative col-span-1 cursor-pointer overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] text-sm shadow-[0_18px_45px_rgba(0,0,0,0.08)] transition duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-[0_26px_65px_rgba(0,0,0,0.14)] ${
        loading ? "pointer-events-none opacity-70" : ""
      }`}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70">
          <Loader />
        </div>
      )}

      <div className="flex h-full w-full flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-muted)] sm:aspect-[3/4]">
          <Image
            src={cardProductImage}
            alt={data.name}
            fill
            sizes="(max-width: 640px) calc(100vw - 24px), (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center opacity-100 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-0"
          />
          <Image
            src={cardHoverImage}
            alt={`${data.name} alternate view`}
            fill
            sizes="(max-width: 640px) calc(100vw - 24px), (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover object-center opacity-0 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
          />

          <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black">
            New
          </span>
          {discount ? (
            <span className="absolute left-3 top-12 bg-[var(--color-accent-alt)] px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white">
              -{discount}%
            </span>
          ) : null}

          <button
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black"
            onClick={(event) => {
              event.stopPropagation();
              toggleWishlist(data.id);
            }}
          >
            {isWishlisted(data.id) ? <FaHeart size={15} /> : <FiHeart size={18} />}
          </button>
        </div>

        <div className="flex flex-1 flex-col px-3 pb-4 pt-3 sm:px-4 sm:pt-4">
          <h3 className="line-clamp-2 text-sm font-black uppercase leading-snug text-[var(--color-primary)] sm:text-[15px]">
            {truncateText(data.name)}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-[var(--color-secondary)] sm:gap-2 sm:text-xs">
            <Rating value={productRating} readOnly size="small" />
            <span>{reviews.length} reviews</span>
          </div>

          <div className="mt-3 flex items-baseline gap-2 text-sm font-black text-[var(--color-primary)] sm:text-base">
            {hasSalePrice ? (
              <>
                <span className="text-[var(--color-accent)]">{formatPrice(displayPrice)}</span>
                <span className="text-xs text-[var(--color-secondary)] line-through">
                  {formatPrice(data.price)}
                </span>
              </>
            ) : (
              <span>{formatPrice(displayPrice)}</span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase text-[var(--color-secondary)]">
            {displaySizes.slice(0, 5).map((size: string) => (
              <span key={size} className="border border-[var(--color-border)] px-2 py-1">
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
