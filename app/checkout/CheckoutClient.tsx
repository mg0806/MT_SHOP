"use client";

import { useCart } from "@/hooks/useCart";
import { SafeUser } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice } from "@/Utils/formatPrice";
import SecureCheckoutButton from "@/components/checkout/SecureCheckoutButton";

const steps = ["Address", "Delivery", "Payment", "Confirm"];

type SavedAddress = {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
};

const CheckoutClient = ({ currentUser }: { currentUser: SafeUser | null }) => {
  const {
    cartProducts,
    shippingData,
    correctedGrandTotal,
    cartTotalAmount,
    handleClearCart,
  } = useCart();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [codLoading, setCodLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: currentUser?.name || "",
    phone: "",
    email: currentUser?.email || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: shippingData?.pincode || "",
  });
  const router = useRouter();
  const codCharge = paymentMethod === "cod" ? 20 : 0;
  const checkoutTotal = correctedGrandTotal + codCharge;

  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!currentUser) return;
      setAddressesLoading(true);
      try {
        const res = await fetch("/api/addresses");
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Unable to load addresses");
        setSavedAddresses(data);

        const preferred =
          data.find((item: SavedAddress) => item.pincode === shippingData?.pincode) ||
          data[0];

        if (preferred) {
          setAddressId(preferred.id);
          setAddress({
            fullName: preferred.fullName || "",
            phone: preferred.phone || "",
            email: preferred.email || currentUser.email || "",
            line1: preferred.line1 || "",
            line2: preferred.line2 || "",
            city: preferred.city || "",
            state: preferred.state || "",
            pincode: preferred.pincode || shippingData?.pincode || "",
          });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load saved addresses");
      } finally {
        setAddressesLoading(false);
      }
    };

    loadSavedAddresses();
  }, [currentUser, shippingData?.pincode]);

  const selectSavedAddress = (savedAddress: SavedAddress) => {
    setAddressId(savedAddress.id);
    setAddress({
      fullName: savedAddress.fullName || "",
      phone: savedAddress.phone || "",
      email: savedAddress.email || currentUser?.email || "",
      line1: savedAddress.line1 || "",
      line2: savedAddress.line2 || "",
      city: savedAddress.city || "",
      state: savedAddress.state || "",
      pincode: savedAddress.pincode || "",
    });
  };

  const updateAddress = (key: string, value: string) => {
    const next = { ...address, [key]: value };
    if (key === "pincode" && value.length === 6) {
      next.city = next.city || "Auto-filled city";
      next.state = next.state || "Auto-filled state";
    }
    setAddressId(null);
    setAddress(next);
  };

  const saveAddress = async () => {
    const required = ["fullName", "phone", "line1", "city", "state", "pincode"];
    if (required.some((key) => !(address as any)[key])) {
      toast.error("Please fill required address fields");
      return null;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(address),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to save address");
      setAddressId(data.id);
      setSavedAddresses((prev) => [data, ...prev.filter((item) => item.id !== data.id)]);
      toast.success("Address saved");
      return data.id as string;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save address");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const confirmCodOrder = async () => {
    if (!addressId) {
      toast.error("Save/select an address before confirming order");
      setStep(0);
      return;
    }
    setCodLoading(true);
    try {
      const res = await fetch("/api/checkout/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartProducts?.map((item) => ({
            productId: item.id,
            qty: item.quantity,
          })),
          couponCode: couponCode || null,
          addressId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unable to confirm COD order");
      toast.success("COD order confirmed");
      handleClearCart();
      router.push(`/order/${data.orderId}?confirmed=1`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to confirm COD order");
    } finally {
      setCodLoading(false);
    }
  };

  if (!cartProducts || cartProducts.length === 0) {
    return (
      <div className="grid min-h-[360px] place-items-center text-center">
        <div>
          <h1 className="text-4xl font-black uppercase">Your cart is empty</h1>
          <button
            onClick={() => router.push("/shop")}
            className="mt-5 bg-[var(--color-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)]"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px] xl:gap-8">
      <div>
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:mb-8">
          {steps.map((item, index) => (
            <button
              key={item}
              onClick={() => setStep(index)}
              className={`min-h-11 border px-2 text-[11px] font-black uppercase tracking-[0.1em] sm:min-h-12 sm:text-xs sm:tracking-[0.12em] ${
                step === index
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
                  : "border-[var(--color-border)] text-[var(--color-secondary)]"
              }`}
            >
              {index + 1}. {item}
            </button>
          ))}
        </div>

        {step === 0 && (
          <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="mb-5 text-2xl font-black uppercase">Address</h2>
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                  Saved Addresses
                </p>
                {addressesLoading ? (
                  <span className="text-xs font-bold text-[var(--color-secondary)]">Loading...</span>
                ) : null}
              </div>

              {savedAddresses.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {savedAddresses.map((savedAddress) => {
                    const selected = addressId === savedAddress.id;
                    return (
                      <button
                        key={savedAddress.id}
                        type="button"
                        onClick={() => selectSavedAddress(savedAddress)}
                        className={`border p-4 text-left transition ${
                          selected
                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                            : "border-[var(--color-border)] bg-[var(--color-muted)] hover:border-[var(--color-primary)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-black uppercase text-[var(--color-primary)]">
                            {savedAddress.fullName}
                          </p>
                          {selected ? (
                            <span className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-accent)]">
                              Selected
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-[var(--color-secondary)]">
                          {savedAddress.line1}
                          {savedAddress.line2 ? `, ${savedAddress.line2}` : ""}, {savedAddress.city}, {savedAddress.state} - {savedAddress.pincode}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[var(--color-secondary)]">
                          {savedAddress.phone}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] p-4 text-sm font-bold text-[var(--color-secondary)]">
                  No saved addresses yet. Save one below and it will appear here next time.
                </div>
              )}
            </div>

            <div className="mb-4 border-t border-[var(--color-border)] pt-5">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                {addressId ? "Selected address details" : "Add new address"}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["fullName", "Full Name"],
                ["phone", "Phone"],
                ["email", "Email"],
                ["line1", "Address Line 1"],
                ["line2", "Address Line 2"],
                ["city", "City"],
                ["state", "State"],
                ["pincode", "Pincode"],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                  {label}
                  <input
                    value={(address as any)[key]}
                    onChange={(event) => updateAddress(key, event.target.value)}
                    className="mt-2 h-12 w-full border border-[var(--color-border)] px-3 text-sm"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={async () => {
                const id = addressId || (await saveAddress());
                if (id) setStep(1);
              }}
              disabled={loading}
              className="mt-5 bg-[var(--color-accent)] px-6 py-3 text-xs font-black uppercase text-[var(--color-bg)] disabled:opacity-50"
            >
              {addressId ? "Use selected address" : loading ? "Saving..." : "Save address"}
            </button>
          </section>
        )}

        {step === 1 && (
          <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-2xl font-black uppercase">Delivery Confirmed</h2>
            <p className="mt-3 text-sm text-[var(--color-secondary)]">
              Delivery charges were already calculated in your cart from the checked pincode.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Pincode</p>
                <p className="mt-2 text-lg font-black">{shippingData?.pincode || address.pincode || "-"}</p>
              </div>
              <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Delivery ETA</p>
                <p className="mt-2 text-lg font-black">
                  {shippingData?.estimatedDays && shippingData.estimatedDays !== "-"
                    ? `${shippingData.estimatedDays} days`
                    : "Confirmed at dispatch"}
                </p>
              </div>
              <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Delivery Charge</p>
                <p className="mt-2 text-lg font-black text-[var(--color-accent)]">
                  {correctedGrandTotal - cartTotalAmount <= 0
                    ? "FREE"
                    : formatPrice(correctedGrandTotal - cartTotalAmount)}
                </p>
              </div>
            </div>
            {cartTotalAmount >= 999 ? (
              <div className="mt-4 border border-[var(--color-success)] bg-[var(--color-success)]/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-success)]">
                Free delivery applied because your cart is above Rs.999.
              </div>
            ) : null}
          </section>
        )}

        {step === 2 && (
          <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="mb-4 text-2xl font-black uppercase">Payment</h2>
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              {[
                ["online", "Online Payment", "Pay securely with Razorpay"],
                ["cod", "Cash on Delivery", "Pay on delivery. Rs.20 COD charge applies"],
              ].map(([value, title, description]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value as "online" | "cod")}
                  className={`border p-5 text-left transition ${
                    paymentMethod === value
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-muted)]"
                  }`}
                >
                  <p className="font-black uppercase text-[var(--color-primary)]">{title}</p>
                  <p className="mt-2 text-sm text-[var(--color-secondary)]">{description}</p>
                </button>
              ))}
            </div>
            <label className="mb-4 block text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
              Coupon code
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                className="mt-2 h-12 w-full border border-[var(--color-border)] px-3 text-sm"
                placeholder="Optional"
              />
            </label>
            {paymentMethod === "online" ? (
              <>
                <p className="mb-4 text-xs text-[var(--color-secondary)]">256-bit SSL encrypted payment. Amount is computed on the server.</p>
                <SecureCheckoutButton
                  cartItems={cartProducts.map((item) => ({ id: item.id, quantity: item.quantity }))}
                  couponCode={couponCode}
                  addressId={addressId}
                  disabled={!addressId}
                />
              </>
            ) : (
              <button
                onClick={() => setStep(3)}
                disabled={!addressId}
                className="w-full bg-[var(--color-accent)] py-4 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-bg)] disabled:opacity-50"
              >
                Continue to confirm
              </button>
            )}
          </section>
        )}

        {step === 3 && (
          <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <h2 className="text-2xl font-black uppercase">Confirm COD Order</h2>
            <p className="mt-3 text-[var(--color-secondary)]">Review your order and contact details before placing the COD order.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Contact</p>
                <p className="mt-2 font-black text-[var(--color-primary)]">{address.fullName}</p>
                <p className="text-sm text-[var(--color-secondary)]">{address.phone}</p>
                <p className="text-sm text-[var(--color-secondary)]">{address.email}</p>
              </div>
              <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Delivery Address</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-secondary)]">
                  {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            </div>
            <div className="mt-5 border border-[var(--color-border)] p-4">
              <div className="flex justify-between text-sm"><span>Order total</span><span>{formatPrice(correctedGrandTotal)}</span></div>
              <div className="mt-2 flex justify-between text-sm"><span>COD charge</span><span>{formatPrice(20)}</span></div>
              <div className="mt-3 flex justify-between border-t border-[var(--color-border)] pt-3 text-xl font-black"><span>Pay on delivery</span><span>{formatPrice(checkoutTotal)}</span></div>
            </div>
            <button onClick={confirmCodOrder} disabled={codLoading} className="mt-5 w-full bg-[var(--color-accent)] px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-bg)] disabled:opacity-50">
              {codLoading ? "Placing order..." : "Confirm COD order"}
            </button>
          </section>
        )}

        {step < 2 && (
          <button
            onClick={async () => {
              if (step === 0) {
                const id = addressId || (await saveAddress());
                if (!id) return;
              }
              setStep(step + 1);
            }}
            className="mt-6 bg-[var(--color-accent)] px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)]"
          >
            Continue
          </button>
        )}
      </div>

      <aside className="h-fit border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:sticky lg:top-32">
        <h2 className="text-xl font-black uppercase">Order Summary</h2>
        <div className="mt-5 space-y-4">
          {cartProducts.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 text-sm">
              <span className="line-clamp-1">{item.name} x {item.quantity}</span>
              <span className="font-mono">{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 space-y-2 border-t border-[var(--color-border)] pt-4">
          <div className="flex justify-between text-sm text-[var(--color-secondary)]">
            <span>Subtotal</span>
            <span>{formatPrice(cartTotalAmount)}</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--color-secondary)]">
            <span>Delivery</span>
            <span>{correctedGrandTotal - cartTotalAmount <= 0 ? "FREE" : formatPrice(correctedGrandTotal - cartTotalAmount)}</span>
          </div>
          {paymentMethod === "cod" ? (
            <div className="flex justify-between text-sm text-[var(--color-secondary)]">
              <span>COD charge</span>
              <span>{formatPrice(codCharge)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-lg font-black">
            <span>Total</span>
            <span>{formatPrice(checkoutTotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CheckoutClient;
