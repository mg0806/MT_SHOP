import { getCurrentUser } from "@/actions/getCurrentUser";
import getOrdersByUserId from "@/actions/getOrdersByUserId";
import { formatPrice } from "@/Utils/formatPrice";
import Link from "next/link";

const AccountOrdersPage = async () => {
  const user = await getCurrentUser();
  const orders = user ? await getOrdersByUserId(user.id) : [];

  return (
    <div className="px-4 py-10 sm:px-8">
      <h1 className="text-5xl font-black uppercase">Orders</h1>
      <div className="mt-8 grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/account/orders/${order.id}`} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <p className="font-mono text-xs text-[var(--color-secondary)]">{order.id}</p>
                <p className="mt-2 text-xl font-black">{formatPrice(order.amount / 100)}</p>
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-[var(--color-surface-2)] px-3 py-1 text-xs font-black uppercase">{order.status}</span>
                <span className="rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-black uppercase text-[var(--color-bg)]">{order.deliveryStatus || "Processing"}</span>
              </div>
            </div>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-[var(--color-secondary)]">No orders yet.</p>}
      </div>
    </div>
  );
};

export default AccountOrdersPage;
