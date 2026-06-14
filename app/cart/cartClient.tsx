"use client";

import Heading from "@/components/universal/Heading";
import Link from "next/link";
import { MdArrowBack } from "react-icons/md";
import { FREE_DELIVERY_THRESHOLD, useCart } from "@/hooks/useCart";
import Button from "@/components/universal/Button";
import ItemContent from "./itemContent";
import { formatPrice } from "@/Utils/formatPrice";
import { SafeUser } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CartClientProps {
  currentUser: SafeUser | null;
}

const CartClient: React.FC<CartClientProps> = ({ currentUser }) => {
  const {
    cartProducts,
    handleClearCart,
    cartTotalAmount,
    // shippingCharges,
    totalWeight,
    correctedGrandTotal,
    shippingData,
  } = useCart();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Optional: Stop loading after a delay to simulate transition
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false); // fallback safety
      }, 4000); // 4s max wait

      return () => clearTimeout(timeout);
    }
  }, [loading]);

  // const searchParams = useSearchParams();
  // const [shippingInfo, setShippingInfo] = useState<{
  //   shippingCharge: number;
  //   estimatedDays: string;
  // } | null>(null);

  // useEffect(() => {
  //   const encodedData = searchParams?.get("Info");
  //   if (encodedData) {
  //     try {
  //       const parsed = JSON.parse(decodeURIComponent(encodedData));
  //       setShippingInfo(parsed);
  //     } catch (error) {
  //       console.error("Error decoding shipping info:", error);
  //     }
  //   }
  // }, [searchParams]);
  const router = useRouter();

  const rawShippingCharge = Math.ceil(shippingData?.shippingCharge || 0);
  const hasFreeDelivery = cartTotalAmount >= FREE_DELIVERY_THRESHOLD;
  const effectiveShippingCharge = hasFreeDelivery ? 0 : rawShippingCharge;
  const freeDeliveryRemaining = Math.max(FREE_DELIVERY_THRESHOLD - cartTotalAmount, 0);

  // const shippingRules = [
  //   { condition: (weight: number) => weight < 0.5, rate: 50 },
  //   { condition: (weight: number) => weight === 0.5, rate: 80 },
  //   { condition: (weight: number) => weight > 0.5 && weight < 1, rate: 100 },
  //   { condition: (weight: number) => weight >= 1 && weight <= 2, rate: 150 },
  //   { condition: (weight: number) => weight > 2, rate: 200 },
  // ];

  // const calculateShipping = (weight: number): number => {
  //   const rule = shippingRules.find((rule) => rule.condition(weight));
  //   return rule ? rule.rate : 0;
  // };

  // const totalWeight =
  //   cartProducts?.reduce((acc, product) => {
  //     console.log(product);
  //     return acc + (product.weight || 0) * (product.quantity || 1);
  //   }, 0) || 0;

  // const shippingCharges = calculateShipping(totalWeight);
  // const grandTotalAmount = shippingCharges + cartTotalAmount;

  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div className="flex flex-col items-center  ">
        <div className="text-2xl text-center">Your cart is empty</div>
        <div>
          <Link
            href={"/"}
            className="text-slate-500 flex items-center gap-1 mt-2 "
          >
            <MdArrowBack />
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="px-4 sm:px-6 lg:px-0 mt-10">
      <Heading title="Shopping Cart" center />

      {/* Table Headers */}
      <div className="grid grid-cols-5 text-xs pb-2 mt-8 gap-4 font-medium text-slate-600 max-md:hidden">
        <div className="col-span-2 ml-4">PRODUCT</div>
        <div className="text-center">PRICE</div>
        <div className="text-center">QUANTITY</div>
        <div className="text-right mr-4">TOTAL</div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartProducts &&
          cartProducts.map((item) => <ItemContent key={item.id} item={item} />)}
      </div>

      {/* Cart Footer Summary */}
      <div className="border-t border-[var(--color-border)] mt-8 pt-6 flex flex-col md:flex-row justify-between items-start gap-8">
        {/* Clear Cart Button */}
        <div className="w-full md:w-auto">
          <Button lable="Clear Cart" onClick={handleClearCart} small outline />
        </div>

        {/* Summary Section */}
        <div className="w-full max-w-md border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
          <p className="mb-5 text-xl font-black uppercase text-[var(--color-primary)]">
            Cart Summary
          </p>
          <div className="flex justify-between text-base font-black text-[var(--color-primary)]">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotalAmount)}</span>
          </div>

          <div className="mt-4 flex justify-between text-base text-[var(--color-primary)]">
            <span className="font-bold">Shipping Charges</span>
            <span className="font-black">
              {hasFreeDelivery ? "FREE" : formatPrice(effectiveShippingCharge)}
            </span>
          </div>

          {hasFreeDelivery ? (
            <div className="mt-3 border border-[var(--color-success)] bg-[var(--color-success)]/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-success)]">
              Free delivery unlocked on this order
            </div>
          ) : (
            <div className="mt-3 border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-xs font-bold text-[var(--color-secondary)]">
              Add {formatPrice(freeDeliveryRemaining)} more to unlock free delivery over {formatPrice(FREE_DELIVERY_THRESHOLD)}.
            </div>
          )}

          {rawShippingCharge > 0 && hasFreeDelivery ? (
            <div className="mt-2 flex justify-between text-xs text-[var(--color-secondary)]">
              <span>Delivery savings</span>
              <span className="font-black text-[var(--color-success)]">-{formatPrice(rawShippingCharge)}</span>
            </div>
          ) : null}

          {shippingData?.estimatedDays && shippingData.estimatedDays !== "-" ? (
            <div className="mt-4 text-sm text-[var(--color-secondary)]">
              Estimated delivery:{" "}
              <span className="font-black text-[var(--color-primary)]">
                {shippingData.estimatedDays} days
              </span>
            </div>
          ) : (
            <div className="mt-4 text-sm font-bold text-[var(--color-accent-alt)]">
              Check delivery on the product page before checkout.
            </div>
          )}

          <div className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-secondary)]">
            Weight: ({totalWeight.toFixed(2)} kg)
          </div>

          <div className="mt-5 flex justify-between border-t border-[var(--color-border)] pt-4 text-2xl font-black text-[var(--color-primary)]">
            <span>Total</span>
            <span>{formatPrice(correctedGrandTotal)}</span>
          </div>

          <p className="mt-2 text-xs font-medium text-[var(--color-secondary)]">
            Delivery is already included here. Checkout will only confirm your address and payment.
          </p>

          {/* Checkout Button */}
          <Button
            lable={currentUser ? "Checkout" : "Login to Checkout"}
            outline={!currentUser}
            disabled={currentUser ? !shippingData : false}
            onClick={() => {
              if (currentUser) {
                if (!shippingData) {
                  toast.error("Please check delivery before checkout");
                  return;
                }
                setLoading(true);
                router.push("/checkout");
                setTimeout(() => router.push("/checkout"), 200);
              } else {
                router.push("/Login");
              }
            }}
          />

          {/* Continue Shopping Link */}
          <Link
            href="/"
            className="text-[var(--color-secondary)] flex items-center gap-1 mt-4 text-sm font-bold hover:text-[var(--color-primary)]"
          >
            <MdArrowBack />
            <span>Continue Shopping</span>
          </Link>

          <div className="mb-24" />
        </div>
      </div>
    </div>
  );
};

export default CartClient;
