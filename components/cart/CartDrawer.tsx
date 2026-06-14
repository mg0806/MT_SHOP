"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FiMinus, FiPlus, FiX } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/Utils/formatPrice";

const freeShippingThreshold = 999;

const CartDrawer = () => {
  const [open, setOpen] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const {
    cartProducts,
    cartTotalAmount,
    cartTotalQty,
    handleCartQtyDecrease,
    handleCartQtyIncrease,
    handleRemoveProductFromCart,
  } = useCart();

  useEffect(() => {
    const openDrawer = () => setOpen(true);
    window.addEventListener("open-cart-drawer", openDrawer);
    return () => window.removeEventListener("open-cart-drawer", openDrawer);
  }, []);

  const remaining = Math.max(0, freeShippingThreshold - cartTotalAmount);
  const progress = useMemo(
    () => Math.min(100, (cartTotalAmount / freeShippingThreshold) * 100),
    [cartTotalAmount],
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-[1100] bg-[var(--color-overlay)] transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setOpen(false)}
      />
      <aside
        aria-label="Cart drawer"
        className={`fixed right-0 top-0 z-[1101] flex h-dvh w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-primary)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
          <h2 className="text-lg font-black uppercase tracking-[0.12em]">
            Your Cart ({cartTotalQty} items)
          </h2>
          <button
            aria-label="Close cart"
            onClick={() => setOpen(false)}
            className="grid min-h-11 min-w-11 place-items-center border border-[var(--color-border)] text-[var(--color-primary)]"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="border-b border-[var(--color-border)] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)]">
            {remaining === 0
              ? "You unlocked free delivery"
              : `You're ${formatPrice(remaining)} away from free delivery`}
          </p>
          <div className="mt-3 h-2 overflow-hidden bg-[var(--color-surface-2)]">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {!cartProducts || cartProducts.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <p className="text-2xl font-black uppercase">Cart is empty</p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-4 border border-[var(--color-primary)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em]"
                >
                  Keep shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {cartProducts.map((item) => {
                const image = item.selectedImg.images?.[0] ?? "/next.svg";
                return (
                  <div
                    key={item.id}
                    className={`grid grid-cols-[80px_1fr] gap-4 overflow-hidden transition-all duration-300 ${
                      removingId === item.id ? "max-h-0 opacity-0" : "max-h-40 opacity-100"
                    }`}
                  >
                    <div className="relative aspect-[4/5] bg-[var(--color-surface)]">
                      <Image src={image} alt={item.name} fill className="object-contain p-2" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold uppercase">{item.name}</p>
                      <p className="mt-1 text-xs text-[var(--color-secondary)]">
                        Color: {item.selectedImg.color || "Default"} | Size: {item.size || "M"}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex border border-[var(--color-border)]">
                          <button
                            aria-label="Decrease quantity"
                            className="grid min-h-9 min-w-9 place-items-center"
                            onClick={() => handleCartQtyDecrease(item)}
                          >
                            <FiMinus />
                          </button>
                          <span className="grid min-h-9 min-w-9 place-items-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            className="grid min-h-9 min-w-9 place-items-center"
                            onClick={() => handleCartQtyIncrease(item)}
                          >
                            <FiPlus />
                          </button>
                        </div>
                        <p className="font-mono text-sm font-bold">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setRemovingId(item.id);
                          window.setTimeout(() => {
                            handleRemoveProductFromCart(item);
                            setRemovingId(null);
                          }, 260);
                        }}
                        className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-secondary)] underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] p-5">
          <div className="flex gap-2">
            <input
              placeholder="Coupon code"
              className="h-12 flex-1 border border-[var(--color-border)] px-3 text-sm uppercase"
            />
            <button className="h-12 bg-[var(--color-surface-2)] px-4 text-xs font-black uppercase tracking-[0.12em]">
              Apply
            </button>
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-[var(--color-secondary)]">
              <span>Subtotal</span>
              <span>{formatPrice(cartTotalAmount)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-secondary)]">
              <span>Delivery</span>
              <span>{remaining === 0 ? "FREE" : "Calculated later"}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--color-border)] pt-3 text-lg font-black">
              <span>Total</span>
              <span>{formatPrice(cartTotalAmount)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            onClick={() => setOpen(false)}
            className="mt-5 flex min-h-[52px] w-full items-center justify-center bg-[var(--color-accent)] text-sm font-black uppercase tracking-[0.14em] text-[var(--color-bg)]"
          >
            Proceed to checkout
          </Link>
          <div className="mt-6">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
              Customers also bought
            </p>
            <div className="flex gap-3 overflow-x-auto">
              {["Oversized Tee", "Slim Shirt", "Cargo Pants"].map((item) => (
                <div key={item} className="min-w-32 border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
                  <div className="aspect-[4/5] bg-[var(--color-surface-2)]" />
                  <p className="mt-2 text-xs font-bold uppercase">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
