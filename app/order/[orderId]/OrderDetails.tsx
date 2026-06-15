"use client";

import { formatPrice } from "@/Utils/formatPrice";
import Modal from "@/components/common/Modal";
import Status from "@/components/Status";
import Heading from "@/components/universal/Heading";
import { Order } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { MdAccessTimeFilled, MdDeliveryDining, MdDone } from "react-icons/md";
import OrderItem from "./OrderItem";

const cancelReasons = [
  "",
  "I already have this product",
  "Too expensive",
  "Ordered by mistake",
  "Found a better option",
  "Delivery is taking too long",
  "Need to change size or color",
  "Other",
];

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const router = useRouter();
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");

  // Parse the products field if it's a stringified JSON
  const parsedProducts =
    typeof order.products === "string"
      ? JSON.parse(order.products)
      : order.products;
  const canReview = order.deliveryStatus === "delivered";
  const shippedDeliveryStatuses = ["dispatched", "shipped", "in_transit", "out_for_delivery", "delivered"];
  const cancelFinalStatuses = ["CANCELED", "CANCELED_REFUND_INITIATED", "REFUNDED"];
  const normalizedDeliveryStatus = String(order.deliveryStatus || "").toLowerCase();
  const canCancelOrder =
    !cancelFinalStatuses.includes(order.status) &&
    order.status !== "CANCELLATION_REQUESTED" &&
    !shippedDeliveryStatuses.includes(normalizedDeliveryStatus);
  const returnStatus = String(order.returnStatus || "");
  const hasActiveReturn = Boolean(returnStatus);
  const canReturnOrder = order.deliveryStatus === "delivered" && !hasActiveReturn;

  const handleCancelOrder = async () => {
    const finalCancelReason = cancelReason === "Other" ? customCancelReason.trim() : cancelReason.trim();

    if (finalCancelReason.length < 8) {
      toast.error("Please add a cancellation reason");
      return;
    }

    setIsCanceling(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: finalCancelReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to cancel order");

      toast.success(data.refundId ? "Order canceled. Refund initiated." : "Order canceled.");
      setShowCancelConfirm(false);
      setCancelReason("");
      setCustomCancelReason("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to cancel order");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleReturnOrder = async () => {
    if (returnReason.trim().length < 10) {
      toast.error("Please add a return reason");
      return;
    }

    setIsReturning(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: returnReason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Unable to request return");

      toast.success("Return request initiated");
      setShowReturnConfirm(false);
      setReturnReason("");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to request return");
    } finally {
      setIsReturning(false);
    }
  };

  // console.log(parsedProducts);
  // console.log("order", order);
  return (
    <div className="mx-auto flex w-full max-w-[1150px] flex-col gap-5 px-3 sm:gap-6 sm:px-4">
      <div className="mt-6 border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)] sm:mt-8 sm:p-6">
        <Heading title="Order Details" />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Order ID</p>
            <p className="mt-2 break-all font-mono text-sm font-black text-[var(--color-primary)]">{order.id}</p>
          </div>
          <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Total Amount</p>
            <p className="mt-2 text-2xl font-black text-[var(--color-primary)]">{formatPrice(order.amount / 100)}</p>
            <p className="mt-1 text-xs font-bold text-[var(--color-secondary)]">Shipping charges included</p>
          </div>
          <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Placed</p>
            <p className="mt-2 text-lg font-black text-[var(--color-primary)]">{moment(order.createdDate).fromNow()}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.06)]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Payment Status</p>
          {order.status === "pending" ? (
            <Status
              text="Pending"
              icon={MdAccessTimeFilled}
              bg="bg-slate-200"
              color="text-slate-700"
            />
          ) : order.status === "complete" ? (
            <Status
              text="Completed"
              icon={MdDone}
              bg="bg-green-200"
              color="text-green-700"
            />
          ) : (
            <Status
              text={order.status}
              icon={MdAccessTimeFilled}
              bg="bg-slate-200"
              color="text-slate-700"
            />
          )}
        </div>

        <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.06)]">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Delivery Status</p>
          {order.deliveryStatus === "pending" ? (
            <Status
              text="Pending"
              icon={MdAccessTimeFilled}
              bg="bg-slate-200"
              color="text-slate-700"
            />
          ) : order.deliveryStatus === "dispatched" ? (
            <Status
              text="Dispatched"
              icon={MdDeliveryDining}
              bg="bg-purple-200"
              color="text-purple-700"
            />
          ) : order.deliveryStatus === "delivered" ? (
            <Status
              text="Delivered"
              icon={MdDone}
              bg="bg-green-200"
              color="text-green-700"
            />
          ) : order.deliveryStatus === "canceled" ? (
            <Status
              text="Canceled"
              icon={MdAccessTimeFilled}
              bg="bg-red-100"
              color="text-red-700"
            />
          ) : null}
        </div>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)] sm:p-5">
        <h2 className="mb-5 text-xl font-black uppercase text-[var(--color-primary)]">Products Ordered</h2>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[560px]">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 border-b border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--color-secondary)]">
              <div className="justify-self-start">Product Image</div>
              <div className="justify-self-center">Product Name</div>
              <div className="justify-self-center">Color</div>
              <div className="justify-self-center">Price</div>
              <div className="justify-self-center">QTY</div>
            </div>

            {/* Table Rows */}
            {Array.isArray(parsedProducts) &&
              parsedProducts.map((item: any, index: number) => (
                <OrderItem key={item.id || item.productId || `${item.name}-${index}`} item={item} />
              ))}
          </div>
        </div>

        {/* Track Button */}
        <div className="mt-6 border-t border-[var(--color-border)] pt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => {
                if (!order.awb) return;
                router.push(`/order/${order.id}/track?awb=${order.awb}`);
              }}
              disabled={!order.awb}
              className={`w-full px-5 py-3 text-xs font-black uppercase tracking-[0.12em] transition sm:w-fit ${
                order.awb
                  ? "bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-primary)]"
                  : "cursor-not-allowed bg-[var(--color-muted)] text-[var(--color-secondary)]"
              }`}
            >
              {order.awb ? "Track Order" : "Tracking will be available soon"}
            </button>

            {canCancelOrder && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={isCanceling}
                className="w-full border border-red-500 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              >
                {isCanceling ? "Canceling..." : "Cancel Order"}
              </button>
            )}
            {canReturnOrder && (
              <button
                onClick={() => setShowReturnConfirm(true)}
                disabled={isReturning}
                className="w-full border border-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-accent)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-fit"
              >
                {isReturning ? "Requesting..." : "Return Product"}
              </button>
            )}
          </div>
          {!canCancelOrder && order.deliveryStatus !== "canceled" && (
            <p className="mt-3 text-xs font-bold text-[var(--color-secondary)]">
              Orders can be canceled only before they are shipped.
            </p>
          )}
        </div>
      </div>

      {hasActiveReturn && (
        <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
          <p className="fashion-kicker">Return Progress</p>
          <h2 className="mt-2 text-xl font-black uppercase text-[var(--color-primary)]">Return request {returnStatus.toLowerCase().replace(/_/g, " ")}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {["REQUESTED", "PICKUP", "RECEIVED", "REFUND_INITIATED"].map((step, index) => {
              const activeIndex =
                returnStatus === "REFUND_INITIATED" || returnStatus === "REFUNDED"
                  ? 3
                  : returnStatus === "RECEIVED" || returnStatus === "RECEIVED_NO_ONLINE_REFUND"
                    ? 2
                    : returnStatus === "IN_TRANSIT" || returnStatus === "PICKUP_SCHEDULED"
                      ? 1
                      : 0;
              const isActive = index <= activeIndex;
              return (
                <div key={step} className="flex items-center gap-2">
                  <span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black ${isActive ? "bg-[var(--color-accent)] text-[var(--color-bg)]" : "bg-[var(--color-muted)] text-[var(--color-secondary)]"}`}>
                    {index + 1}
                  </span>
                  <span className="text-xs font-black uppercase tracking-[0.08em] text-[var(--color-secondary)]">{step.replace(/_/g, " ")}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-sm leading-6 text-[var(--color-secondary)]">
            After product verification, within 3 - 4 business days your full refund will be initiated after pickup charges deductions.
          </p>
          {order.returnReason && (
            <p className="mt-3 text-sm text-[var(--color-secondary)]">
              <span className="font-black text-[var(--color-primary)]">Reason:</span> {order.returnReason}
            </p>
          )}
        </section>
      )}

      {canReview && (
        <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
          <p className="fashion-kicker">Review Order</p>
          <h2 className="mt-2 text-xl font-black uppercase text-[var(--color-primary)]">
            Share your product review
          </h2>
          <p className="mt-3 text-sm text-[var(--color-secondary)]">
            Your order has been delivered. Review the products you received and help other shoppers choose better.
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Array.isArray(parsedProducts) &&
              parsedProducts.map((item: any, index: number) => {
                const productId = item.productId || item.id;
                if (!productId) return null;

                return (
                  <div
                    key={productId || `${item.name}-review-${index}`}
                    className="flex flex-col gap-3 border border-[var(--color-border)] bg-[var(--color-muted)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-black uppercase text-[var(--color-primary)]">{item.name}</p>
                      <p className="text-xs font-bold text-[var(--color-secondary)]">Qty: {item.qty || item.quantity || 1}</p>
                    </div>
                    <Link
                      href={`/product/${productId}#write-review`}
                      className="inline-flex justify-center bg-[var(--color-accent)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)]"
                    >
                      Write Review
                    </Link>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      <Modal
        open={showCancelConfirm}
        title="Cancel Order"
        onClose={() => {
          if (!isCanceling) setShowCancelConfirm(false);
        }}
      >
        <div className="grid gap-4">
          <p className="text-sm leading-6 text-[var(--color-secondary)]">
            Are you sure you want to cancel this order?
          </p>
          <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Order ID</p>
            <p className="mt-2 break-all font-mono text-sm font-black">{order.id}</p>
            <p className="mt-3 text-lg font-black">{formatPrice(order.amount / 100)}</p>
          </div>
          <label className="grid gap-2 text-sm font-bold text-[var(--color-primary)]">
            Reason for cancellation
            <select
              value={cancelReason}
              onChange={(event) => {
                setCancelReason(event.target.value);
                if (event.target.value !== "Other") setCustomCancelReason("");
              }}
              disabled={isCanceling}
              className="min-h-12 w-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-bold outline-none"
            >
              {cancelReasons.map((reason) => (
                <option key={reason || "placeholder"} value={reason}>
                  {reason || "Select a reason"}
                </option>
              ))}
            </select>
          </label>
          {cancelReason === "Other" && (
            <label className="grid gap-2 text-sm font-bold text-[var(--color-primary)]">
              Other reason
              <textarea
                value={customCancelReason}
                onChange={(event) => setCustomCancelReason(event.target.value)}
                disabled={isCanceling}
                rows={3}
                className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm font-medium outline-none"
                placeholder="Enter cancellation reason"
              />
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleCancelOrder}
              disabled={isCanceling}
              className="min-h-12 bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCanceling ? "Canceling..." : "Confirm Cancellation"}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              disabled={isCanceling}
              className="min-h-12 border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-primary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Keep Order
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showReturnConfirm}
        title="Return Product"
        onClose={() => {
          if (!isReturning) setShowReturnConfirm(false);
        }}
      >
        <div className="grid gap-4">
          <p className="text-sm leading-6 text-[var(--color-secondary)]">
            This will initiate a return request for your delivered order. Refund is initiated only after the returned product reaches the hub and is marked received after verification.
          </p>
          <div className="border border-[var(--color-border)] bg-[var(--color-muted)] p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">Order ID</p>
            <p className="mt-2 break-all font-mono text-sm font-black">{order.id}</p>
            <p className="mt-3 text-lg font-black">{formatPrice(order.amount / 100)}</p>
          </div>
          <label className="grid gap-2 text-sm font-bold text-[var(--color-primary)]">
            Reason for return
            <textarea
              value={returnReason}
              onChange={(event) => setReturnReason(event.target.value)}
              disabled={isReturning}
              rows={4}
              className="w-full border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm font-medium outline-none"
              placeholder="Tell us why you want to return this product"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleReturnOrder}
              disabled={isReturning}
              className="min-h-12 bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)] transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReturning ? "Requesting..." : "Confirm Return"}
            </button>
            <button
              onClick={() => setShowReturnConfirm(false)}
              disabled={isReturning}
              className="min-h-12 border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-primary)] transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Keep Product
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;
