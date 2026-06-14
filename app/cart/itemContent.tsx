import React from "react";
import { CartProductType } from "../product/[productId]/ProductDetails";
import { formatPrice } from "@/Utils/formatPrice";
import Link from "next/link";
import { truncateText } from "@/Utils/truncateText";
import Image from "next/image";
import SetQuantity from "@/components/Products/SetQuantity";
import { useCart } from "@/hooks/useCart";

interface itemContentProps {
  item: CartProductType;
}

const ItemContent: React.FC<itemContentProps> = ({ item }) => {
  const {
    handleRemoveProductFromCart,
    handleCartQtyIncrease,
    handleCartQtyDecrease,
  } = useCart();

  return (
    <div className="w-full">
      <div className="m-2 grid grid-cols-1 items-center gap-y-4 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 text-sm shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition hover:border-[var(--color-primary)] hover:shadow-[0_22px_55px_rgba(0,0,0,0.12)] md:grid-cols-5">
        {/* Product & Image */}
        <div className="md:col-span-2 flex items-start gap-4">
          <Link href={`/product/${item.id}`}>
            <div className="relative aspect-square w-[86px] shrink-0 border border-[var(--color-border)] bg-[var(--color-muted)] p-2">
              <Image
                src={item.selectedImg.images[0]} // ✅ Fixed: Use first image from array
                alt={item.name}
                fill
                className="object-contain p-2"
              />
            </div>
          </Link>
          <div className="flex flex-col justify-between">
            <Link
              href={`/product/${item.id}`}
              className="font-black uppercase leading-snug text-[var(--color-primary)] hover:underline"
            >
              {truncateText(item.name)}
            </Link>
            <div className="mt-1 text-xs font-bold text-[var(--color-secondary)]">
              Color: {item.selectedImg.color} | Size: {item.size || "M"}
            </div>
            <button
              className="mt-2 w-fit text-xs font-black uppercase tracking-[0.08em] text-[var(--color-accent-alt)] underline"
              onClick={() => handleRemoveProductFromCart(item)}
            >
              Remove
            </button>
          </div>
        </div>

        {/* Price - only on medium screens */}
        <div className="hidden text-center font-bold text-[var(--color-primary)] md:block">
          {formatPrice(item.price)}
        </div>

        {/* Quantity control */}
        <div className="hidden md:block justify-self-center">
          <SetQuantity
            cartCounter
            cartProduct={item}
            handleQtyIncrease={() => handleCartQtyIncrease(item)}
            handleQtyDecrease={() => handleCartQtyDecrease(item)}
          />
        </div>

        {/* Total Price */}
        <div className="hidden text-right text-base font-black text-[var(--color-primary)] md:block">
          {formatPrice(item.price * item.quantity)}
        </div>

        {/* Mobile-specific info block */}
        <div className="block w-full flex-col gap-2 border-t border-[var(--color-border)] px-2 pt-3 text-xs text-[var(--color-secondary)] md:hidden">
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-black text-[var(--color-primary)]">{formatPrice(item.price)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Quantity:</span>
            <div className="max-w-[120px]">
              <SetQuantity
                cartCounter
                cartProduct={item}
                handleQtyIncrease={() => handleCartQtyIncrease(item)}
                handleQtyDecrease={() => handleCartQtyDecrease(item)}
              />
            </div>
          </div>
          <div className="flex justify-between text-sm font-black text-[var(--color-primary)]">
            <span>Total:</span>
            <span>{formatPrice(item.price * item.quantity)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemContent;
