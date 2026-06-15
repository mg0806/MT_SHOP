import { getCurrentUser } from "@/actions/getCurrentUser";
import getOrdersByUserId from "@/actions/getOrdersByUserId";
import prisma from "@/libs/prismadb";
import Link from "next/link";

const AccountDashboardPage = async () => {
  const user = await getCurrentUser();
  const [orders, addressCount, wishlistCount] = user
    ? await Promise.all([
        getOrdersByUserId(user.id),
        prisma.savedAddress.count({ where: { userId: user.id } }),
        prisma.wishlistItem.count({ where: { userId: user.id } }),
      ])
    : [[], 0, 0];

  if (!user) {
    return (
      <div className="grid min-h-[420px] place-items-center px-4 text-center">
        <div>
          <h1 className="text-4xl font-black uppercase">Login required</h1>
          <Link href="/account/login" className="mt-5 inline-flex bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase text-[var(--color-bg)]">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-8">
      <h1 className="text-5xl font-black uppercase">Hi, {user.name || "shopper"}</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ["Total orders", orders.length],
          ["Saved addresses", addressCount],
          ["Wishlist count", wishlistCount],
        ].map(([label, value]) => (
          <div key={label} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="text-sm uppercase tracking-[0.14em] text-[var(--color-secondary)]">{label}</p>
            <p className="mt-3 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/account/orders" className="border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase">Orders</Link>
        <Link href="/account/wishlist" className="border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase">Wishlist</Link>
        <Link href="/account/addresses" className="border border-[var(--color-border)] px-5 py-3 text-xs font-black uppercase">Addresses</Link>
      </div>
    </div>
  );
};

export default AccountDashboardPage;
