"use client";

import { formatPrice } from "@/Utils/formatPrice";
import { truncateText } from "@/Utils/truncateText";
import { Rating } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Import useState
import Loader from "../universal/Loader";

interface ProductsCardProps {
  data: any;
}

const ProductCard: React.FC<ProductsCardProps> = ({ data }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false); // State to manage loading

  const productRating =
    data.reviews.reduce((acc: number, item: any) => item.rating + acc, 0) /
    data.reviews.length;

  const handleClick = () => {
    setLoading(true); // Set loading to true when card is clicked

    // Simulate a delay to show the loader before navigation
    setTimeout(() => {
      router.push(`/product/${data.id}`);
    }, 200); // 100ms delay to show the loader
  };

  return (
    <div
      onClick={handleClick}
      className="col-span-1 cursor-pointer border[1.2px] border border-slate-200 bg-slate-50 p-6 rounded-xl transition hover:scale-105 text-center text-sm relative"
    >
      {loading && <Loader />}
      <div className="flex flex-col items-center w-full gap-1">
        <div className="aspect-square overflow-hidden relative w-full">
          <Image
            src={data.images[0].image}
            alt={data.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            className="w-full h-full object-contain "
          />
        </div>
        <div className="mt-4 font-medium">{truncateText(data.name)}</div>
        <div>
          <Rating value={productRating} readOnly />
        </div>
        <div>{data.reviews.length} reviews</div>
        <div className="font-semibold">{formatPrice(data.price)}</div>
      </div>
    </div>
  );
};

export default ProductCard;
