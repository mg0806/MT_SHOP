"use client";

import { formatPrice } from "@/Utils/formatPrice";
import { CartProductType } from "../../product/[productId]/ProductDetails";
import Image from "next/image";

interface OrderItemProps {
  item: CartProductType & {
    productId?: string;
    qty?: number;
    unitPrice?: number;
    lineTotal?: number;
  };
}
const OrderItem: React.FC<OrderItemProps> = ({ item }) => {
  const imageSrc =
    item.selectedImg?.images?.[0] ||
    (Array.isArray((item as any).images) && (item as any).images?.[0]?.images?.[0]) ||
    "/next.svg";
  const color = item.selectedImg?.color || "-";
  const price = Number(item.price ?? item.unitPrice ?? 0);
  const quantity = Number(item.quantity ?? item.qty ?? 1);

  return (
    <div className="grid grid-cols-5 items-center gap-3 border-b border-[var(--color-border)] py-4 text-xs md:gap-4 md:text-sm">
      {/* Product Image */}
      <div className="justify-self-start">
        <div className="relative aspect-square w-[76px] md:w-[110px]">
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-contain rounded"
          />
        </div>
      </div>

      {/* Product Name */}
      <div className="justify-self-center break-words text-center">{item.name}</div>

      {/* Color */}
      <div className="justify-self-center text-gray-500">
        {color}
      </div>

      {/* Price */}
      <div className="justify-self-center">{formatPrice(price)}</div>

      {/* Quantity */}
      <div className="justify-self-center">{quantity}</div>
    </div>
  );
};

export default OrderItem;
