"use client";

import { useCart } from "@/hooks/useCart";
import { CiShoppingCart } from "react-icons/ci";

const CartCount = () => {
  const { cartTotalQty } = useCart();

  return (
    <div
      className="relative cursor-pointer text-[var(--color-primary)] transition hover:text-[var(--color-accent)]"
      onClick={() => window.dispatchEvent(new Event("open-cart-drawer"))}
      aria-label="Open cart"
    >
      <div className="text-2xl sm:text-3xl">
        <CiShoppingCart />
      </div>

      {cartTotalQty > 0 && (
        <span className="absolute -top-2 -right-2 bg-[var(--color-accent)] text-[var(--color-bg)] h-5 w-5 sm:h-6 sm:w-6 rounded-full flex items-center justify-center text-xs sm:text-sm font-black">
          {cartTotalQty}
        </span>
      )}
    </div>
  );
};

export default CartCount;
