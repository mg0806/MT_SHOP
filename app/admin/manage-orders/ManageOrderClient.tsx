"use client";

import { Order, User } from "@prisma/client";
import { formatPrice } from "@/Utils/formatPrice";
import Heading from "@/components/universal/Heading";
import Status from "@/components/Status";
import {
  MdAccessTimeFilled,
  MdDeliveryDining,
  MdDone,
  MdFileDownload,
  MdKeyboardReturn,
  MdRemoveRedEye,
} from "react-icons/md";
import ActionBtn from "@/components/ActionBtn";
import { useCallback, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import moment from "moment";
import Loader from "@/components/universal/Loader";
import Button from "@/components/universal/Button";

interface ManageOrderClientProps {
  orders: ExtendedOrder[];
}

type ExtendedOrder = Order & {
  user: User;
};

const csvHeaders = [
  "Order ID",
  "Payment Intent ID",
  "Customer Name",
  "Customer Email",
  "Amount",
  "Currency",
  "Payment Status",
  "Delivery Status",
  "Courier Name",
  "AWB",
  "Order Date",
  "Products",
  "Address Line 1",
  "Address Line 2",
  "City",
  "State",
  "Postal Code",
  "Country",
];

const escapeCsvValue = (value: unknown) => {
  if (value === null || value === undefined) return "";

  const stringValue =
    value instanceof Date ? value.toISOString() : String(value);

  return /[",\n\r]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
};

const formatProductsForCsv = (products: unknown) => {
  if (!Array.isArray(products)) return "";

  return products
    .map((product: any) => {
      const quantity = product?.quantity ? ` x ${product.quantity}` : "";
      const price =
        typeof product?.price === "number" ? ` @ ${formatPrice(product.price)}` : "";

      return `${product?.name || product?.id || "Product"}${quantity}${price}`;
    })
    .join("; ");
};

const ManageOrderClient: React.FC<ManageOrderClientProps> = ({ orders }) => {
  const router = useRouter();
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  let rows: any = [];
  if (orders) {
    // console.log(orders);
    rows = orders.map((order) => {
      return {
        id: order.id,
        customer: order.user.name,
        amount: formatPrice(order.amount / 100),
        paymentStatus: order.status,
        date: moment(order.createdDate).fromNow(),
        deliverySatus: order.deliveryStatus,
        returnStatus: order.returnStatus,
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

  const handelDispatch = useCallback(
    (id: string) => {
      setLoadingOrderId(id);
      axios
        .put("/api/order", {
          id,
          deliveryStatus: "dispatched",
        })
        .then((res) => {
          toast.success("Order Dispatched");
          router.refresh();
          setLoadingOrderId(null);
        })
        .catch((err) => {
          toast.error("Something went wrong");
          // console.log(err);
        });
    },
    [router]
  );

  const handelDeliver = useCallback(
    (id: string) => {
      setLoadingOrderId(id);

      axios
        .put("/api/order", {
          id,
          deliveryStatus: "delivered",
        })
        .then((res) => {
          toast.success("Order Delivered");
          router.refresh();
          setLoadingOrderId(null);
        })
        .catch((err) => {
          toast.error("Something went wrong");
          // console.log(err);
        });
    },
    [router]
  );

  const handleReturnReceived = useCallback(
    (id: string) => {
      setLoadingOrderId(id);
      axios
        .post(`/api/admin/orders/${id}/return-received`)
        .then((res) => {
          toast.success(res.data?.refundId ? "Return received. Refund initiated." : "Return received.");
          router.refresh();
          setLoadingOrderId(null);
        })
        .catch((err) => {
          toast.error(err.response?.data?.error || "Unable to mark return received");
          setLoadingOrderId(null);
        });
    },
    [router],
  );

  const handleExportOrders = useCallback(() => {
    if (!orders.length) {
      toast.error("No orders available to export");
      return;
    }

    const csvRows = orders.map((order) => {
      const address = order.address;

      return [
        order.id,
        order.paymentIntentId,
        order.user.name,
        order.user.email,
        (order.amount / 100).toFixed(2),
        order.currency,
        order.status,
        order.deliveryStatus,
        order.courierName,
        order.awb,
        moment(order.createdDate).format("YYYY-MM-DD HH:mm:ss"),
        formatProductsForCsv(order.products),
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
      ]
        .map(escapeCsvValue)
        .join(",");
    });

    const csv = [csvHeaders.join(","), ...csvRows].join("\n");
    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `orders-${moment().format("YYYY-MM-DD")}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [orders]);

  if (loading) {
    return <Loader />;
  }
  return (
    <div className="m-auto max-w-[1150px] px-4 py-8">
      <div className=" mb-4 mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:flex-1">
          <Heading title="Manage Orders" center />
        </div>
        <div className="w-full sm:w-auto">
          <Button
            lable="Export CSV"
            icon={MdFileDownload}
            outline
            small
            disabled={!orders.length}
            onClick={handleExportOrders}
          />
        </div>
      </div>
      <div className="overflow-x-auto border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full min-w-[980px] border-collapse text-sm text-[var(--color-primary)]">
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
              rows.map((row: any) => {
                const isLoading = loadingOrderId === row.id;
                return (
                  <tr key={row.id} className="border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-surface-2)]">
                    <td className="max-w-[180px] px-4 py-4 font-mono text-xs text-[var(--color-secondary)]">{row.id}</td>
                    <td className="px-4 py-4 font-semibold">{row.customer || "-"}</td>
                    <td className="px-4 py-4 font-black">{row.amount}</td>
                    <td className="px-4 py-4">{renderPaymentStatus(row.paymentStatus)}</td>
                    <td className="px-4 py-4">{renderDeliveryStatus(row.deliverySatus)}</td>
                    <td className="px-4 py-4 text-[var(--color-secondary)]">{row.date}</td>
                    <td className="px-4 py-4">
                      {isLoading ? (
                        <Loader />
                      ) : (
                        <div className="flex gap-3">
                          <ActionBtn icon={MdDeliveryDining} onClick={() => handelDispatch(row.id)} />
                          <ActionBtn icon={MdDone} onClick={() => handelDeliver(row.id)} />
                          {row.returnStatus === "REQUESTED" || row.returnStatus === "IN_TRANSIT" ? (
                            <ActionBtn icon={MdKeyboardReturn} onClick={() => handleReturnReceived(row.id)} />
                          ) : null}
                          <ActionBtn
                            icon={MdRemoveRedEye}
                            onClick={() => {
                              setLoading(true);
                              router.push(`/order/${row.id}`);
                            }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrderClient;
