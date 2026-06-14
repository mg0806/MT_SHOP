"use client";

import { formatPrice } from "@/Utils/formatPrice";
import Status from "@/components/Status";
import Heading from "@/components/universal/Heading";
import { Order } from "@prisma/client";
import moment from "moment";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdAccessTimeFilled, MdDeliveryDining, MdDone } from "react-icons/md";
import OrderItem from "./OrderItem";

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const router = useRouter();

  // Parse the products field if it's a stringified JSON
  const parsedProducts =
    typeof order.products === "string"
      ? JSON.parse(order.products)
      : order.products;
  const canReview = order.deliveryStatus === "delivered";

  // console.log(parsedProducts);
  // console.log("order", order);
  return (
    <div className="mx-auto flex w-full max-w-[1150px] flex-col gap-6 px-4">
      <div className="mt-8 border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
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

      <div className="grid gap-4 md:grid-cols-2">
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
          ) : null}
        </div>
      </div>

      <div className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
        <h2 className="mb-5 text-xl font-black uppercase text-[var(--color-primary)]">Products Ordered</h2>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[600px]">
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
        </div>
      </div>

      <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
        <p className="fashion-kicker">Review Order</p>
        <h2 className="mt-2 text-xl font-black uppercase text-[var(--color-primary)]">
          {canReview ? "Share your product review" : "Reviews unlock after delivery"}
        </h2>
        <p className="mt-3 text-sm text-[var(--color-secondary)]">
          {canReview
            ? "Your order has been delivered. Review the products you received and help other shoppers choose better."
            : "You can write product reviews once this order is marked as delivered."}
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {Array.isArray(parsedProducts) &&
            parsedProducts.map((item: any, index: number) => {
              const productId = item.productId || item.id;
              return (
                <div
                  key={productId || `${item.name}-review-${index}`}
                  className="flex flex-col gap-3 border border-[var(--color-border)] bg-[var(--color-muted)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-black uppercase text-[var(--color-primary)]">{item.name}</p>
                    <p className="text-xs font-bold text-[var(--color-secondary)]">Qty: {item.qty || item.quantity || 1}</p>
                  </div>
                  {canReview && productId ? (
                    <Link
                      href={`/product/${productId}#write-review`}
                      className="inline-flex justify-center bg-[var(--color-accent)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)]"
                    >
                      Write Review
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="bg-[var(--color-surface)] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]"
                    >
                      Awaiting delivery
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default OrderDetails;
