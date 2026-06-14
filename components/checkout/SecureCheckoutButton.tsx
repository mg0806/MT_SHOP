"use client";

import Script from "next/script";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type SecureCheckoutButtonProps = {
  cartItems: Array<{ id: string; quantity: number }>;
  couponCode?: string | null;
  addressId: string | null;
  disabled?: boolean;
};

const SecureCheckoutButton = ({
  cartItems,
  couponCode,
  addressId,
  disabled,
}: SecureCheckoutButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleClearCart, handelSetPaymentIntent } = useCart();

  const initiateCheckoutOrder = async () => {
    const initiateRes = await fetch("/api/checkout/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: cartItems.map((item) => ({
          productId: item.id,
          qty: item.quantity,
        })),
        couponCode: couponCode || null,
        addressId,
      }),
    });
    const data = await initiateRes.json();
    if (!initiateRes.ok) throw new Error(data.error || "Checkout initiation failed");
    return data;
  };

  const handleCheckout = async () => {
    if (!addressId) {
      toast.error("Save/select an address before payment");
      return;
    }
    if (!window.Razorpay) {
      toast.error("Razorpay is still loading. Try again.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const data = await initiateCheckoutOrder();

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "MTShop",
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              internalOrderId: data.internalOrderId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed");
          handleClearCart();
          handelSetPaymentIntent(null);
          window.location.href = `/order/${verifyData.orderId}?confirmed=1`;
        },
        modal: { ondismiss: () => setLoading(false) },
        theme: { color: "#E8FF00" },
      });

      razorpay.on("payment.failed", (result: any) => {
        const message = result?.error?.description || "Payment failed";
        setError(message);
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button
        onClick={handleCheckout}
        disabled={disabled || loading}
        className="w-full bg-[var(--color-accent)] py-4 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-bg)] disabled:opacity-50"
      >
        {loading ? "Processing..." : "Proceed to payment"}
      </button>
      {error && <p className="mt-2 text-sm text-[var(--color-accent-alt)]">{error}</p>}
    </>
  );
};

export default SecureCheckoutButton;
