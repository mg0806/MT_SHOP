"use client";

import { Order, User } from "@prisma/client";
import { formatPrice } from "@/Utils/formatPrice";
import Heading from "@/components/universal/Heading";
import Status from "@/components/Status";
import {
  MdAccessTimeFilled,
  MdDeliveryDining,
  MdDone,
  MdRemoveRedEye,
} from "react-icons/md";
import ActionBtn from "@/components/ActionBtn";
import { useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import moment from "moment";

interface OrderClientProps {
  orders: ExtendedOrder[];
}

type ExtendedOrder = Order & {
  user: User;
};

const OrderClient: React.FC<OrderClientProps> = ({ orders }) => {
  const router = useRouter();

  let rows: any = [];
  if (orders) {
    rows = orders.map((order) => {
      return {
        id: order.id,
        customer: order.user.name,
        amount: formatPrice(order.amount / 100),
        paymentStatus: order.status,
        date: moment(order.createdDate).fromNow(),
        deliverySatus: order.deliveryStatus,
      };
    });
  }

  const renderPaymentStatus = (status: string) =>
    status === "pending" ? (
      <Status text="Pending" icon={MdAccessTimeFilled} bg="bg-slate-200" color=" text-slate-700" />
    ) : status === "complete" || status === "PAID" || status === "PROCESSING" ? (
      <Status text="Completed" icon={MdDone} bg="bg-green-200" color=" text-green-700" />
    ) : (
      <span className="text-[var(--color-secondary)]">{status || "-"}</span>
    );

  const renderDeliveryStatus = (status: string) =>
    status === "pending" ? (
      <Status text="Pending" icon={MdAccessTimeFilled} bg="bg-slate-200" color=" text-slate-700" />
    ) : status === "dispatched" ? (
      <Status text="Dispatched" icon={MdDeliveryDining} bg="bg-purple-200" color=" text-purple-700" />
    ) : status === "delivered" ? (
      <Status text="Delivered" icon={MdDone} bg="bg-green-200" color=" text-green-700" />
    ) : (
      <span className="text-[var(--color-secondary)]">{status || "-"}</span>
    );

  return (
    <div className="m-auto max-w-[1150px] px-4 py-8">
      <div className=" mb-4 mt-8">
        <Heading title=" Orders" center />
      </div>
      <div className="overflow-x-auto border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[900px] border-collapse text-sm text-[var(--color-primary)]">
          <thead className="bg-[var(--color-surface-2)]">
            <tr className="border-b border-[var(--color-border)]">
              {["ID", "Customer Name", "Amount(INR)", "Payment Status", "Delivery Status", "Date", "Action"].map((heading) => (
                <th key={heading} className="px-4 py-4 text-left text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center font-semibold text-[var(--color-secondary)]">
                  No orders found
                </td>
              </tr>
            ) : (
              rows.map((row: any) => (
                <tr key={row.id} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-2)]">
                  <td className="max-w-[180px] px-4 py-4 font-mono text-xs text-[var(--color-secondary)]">{row.id}</td>
                  <td className="px-4 py-4 font-semibold">{row.customer || "-"}</td>
                  <td className="px-4 py-4 font-black">{row.amount}</td>
                  <td className="px-4 py-4">{renderPaymentStatus(row.paymentStatus)}</td>
                  <td className="px-4 py-4">{renderDeliveryStatus(row.deliverySatus)}</td>
                  <td className="px-4 py-4 text-[var(--color-secondary)]">{row.date}</td>
                  <td className="px-4 py-4">
                    <ActionBtn icon={MdRemoveRedEye} onClick={() => router.push(`/order/${row.id}`)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderClient;
