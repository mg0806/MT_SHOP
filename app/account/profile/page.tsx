import { getCurrentUser } from "@/actions/getCurrentUser";
import getOrdersByUserId from "@/actions/getOrdersByUserId";
import prisma from "@/libs/prismadb";
import Link from "next/link";
import { FiHeart, FiMapPin, FiPackage } from "react-icons/fi";

const DetailRow = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="border-b border-[var(--color-border)] py-4 last:border-b-0">
    <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">{label}</p>
    <p className="mt-2 break-words text-base font-semibold text-[var(--color-primary)]">{value || "Not added"}</p>
  </div>
);

const quickLinks = [
  { href: "/orders", label: "Orders", icon: FiPackage },
  { href: "/account/addresses", label: "Addresses", icon: FiMapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: FiHeart },
];

const AccountProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="grid min-h-[420px] place-items-center px-4 text-center">
        <div>
          <h1 className="text-4xl font-black uppercase">Login required</h1>
          <p className="mt-3 text-[var(--color-secondary)]">Login to view your profile and account details.</p>
          <Link href="/Login" className="mt-5 inline-flex bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase text-[var(--color-bg)]">
            Login
          </Link>
        </div>
      </div>
    );
  }

  const [orders, addresses, wishlistCount, reviewCount] = await Promise.all([
    getOrdersByUserId(user.id),
    prisma.savedAddress.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.wishlistItem.count({ where: { userId: user.id } }),
    prisma.review.count({ where: { userId: user.id } }),
  ]);

  const primaryAddress = addresses[0];
  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) : null;

  return (
    <div className="px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-5 border-b border-[var(--color-border)] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--color-secondary)]">My account</p>
            <h1 className="mt-2 text-4xl font-black uppercase sm:text-5xl">Profile</h1>
            <p className="mt-3 max-w-2xl text-[var(--color-secondary)]">
              Manage your personal details, contact info, saved addresses, orders, wishlist, and reviews.
            </p>
          </div>
          <Link href="/account/addresses" className="inline-flex h-12 items-center justify-center border border-[var(--color-border)] px-5 text-xs font-black uppercase tracking-[0.12em]">
            Manage addresses
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Orders", orders.length],
            ["Saved addresses", addresses.length],
            ["Wishlist", wishlistCount],
            ["Reviews", reviewCount],
          ].map(([label, value]) => (
            <div key={label} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">{label}</p>
              <p className="mt-3 text-3xl font-black text-[var(--color-primary)]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-xl font-black uppercase">User information</h2>
            <div className="mt-4">
              <DetailRow label="Full name" value={user.name} />
              <DetailRow label="Email" value={user.email} />
              <DetailRow label="Account type" value={user.role} />
              <DetailRow label="Member since" value={joinedDate} />
            </div>
          </section>

          <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="text-xl font-black uppercase">Contact information</h2>
            <div className="mt-4">
              <DetailRow label="Email" value={primaryAddress?.email || user.email} />
              <DetailRow label="Phone" value={primaryAddress?.phone} />
              <DetailRow label="Default contact name" value={primaryAddress?.fullName || user.name} />
            </div>
          </section>
        </div>

        <section className="mt-6 border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-black uppercase">Address information</h2>
            <Link href="/account/addresses" className="text-xs font-black uppercase tracking-[0.12em] text-[var(--color-accent-alt)]">
              Add or edit
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {addresses.slice(0, 4).map((address) => (
              <div key={address.id} className="border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                <p className="font-black uppercase text-[var(--color-primary)]">{address.fullName}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-secondary)]">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--color-primary)]">{address.phone}</p>
              </div>
            ))}
            {addresses.length === 0 && (
              <div className="border border-dashed border-[var(--color-border)] p-6 text-[var(--color-secondary)]">
                No saved addresses yet.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm font-black uppercase tracking-[0.1em]">
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
};

export default AccountProfilePage;
