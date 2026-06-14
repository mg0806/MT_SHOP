import getOrderById from "@/actions/getOrderById";
import { formatPrice } from "@/Utils/formatPrice";
import Link from "next/link";

const AccountOrderDetailPage = async ({ params }: { params: { id: string } }) => {
  const order = await getOrderById({ orderId: params.id });

  if (!order) return <div className="p-8">Order not found.</div>;

  return (
    <div className="px-4 py-10 sm:px-8">
      <p className="text-xs uppercase tracking-[0.14em] text-[var(--color-secondary)]">Order detail</p>
      <h1 className="mt-2 text-4xl font-black uppercase">{order.id}</h1>
      <p className="mt-4 text-2xl font-black">{formatPrice(order.amount / 100)}</p>
      <div className="mt-8 grid gap-3 md:grid-cols-4">
        {["Placed", "Confirmed", "Shipped", "Delivered"].map((step, index) => (
          <div key={step} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="font-black">{index + 1}. {step}</p>
          </div>
        ))}
      </div>
      <Link href={`/order/${order.id}/track`} className="mt-6 inline-flex bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase text-[var(--color-bg)]">
        Tracking link
      </Link>
    </div>
  );
};

export default AccountOrderDetailPage;
