"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { FiHeart, FiLogIn, FiMenu, FiPackage, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { SafeUser } from "@/types";
import ThemeToggle from "../universal/ThemeToggle";

const baseLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/new-arrivals", label: "New arrivals" },
  { href: "/cart", label: "Cart", icon: FiShoppingBag },
];

const accountLinks = [
  { href: "/account/profile", label: "Profile", icon: FiUser },
  { href: "/orders", label: "Orders", icon: FiPackage },
  { href: "/account/wishlist", label: "Wishlist", icon: FiHeart },
];

const MobileMenu = ({ currentUser }: { currentUser: SafeUser | null }) => {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const handleSignOut = async () => {
    close();
    await signOut({ callbackUrl: "/Login" });
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid min-h-11 min-w-11 place-items-center text-[var(--color-primary)] md:hidden"
      >
        <FiMenu size={24} />
      </button>

      <div
        className={`fixed inset-0 z-[1200] bg-black/55 transition md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={close}
      />

      <aside
        aria-label="Mobile navigation"
        className={`fixed right-0 top-0 z-[1201] flex h-dvh w-[min(86vw,360px)] flex-col border-l border-[var(--color-border)] bg-[var(--color-bg)] shadow-[-18px_0_45px_rgba(0,0,0,0.22)] transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-secondary)]">Menu</p>
            <p className="mt-1 text-lg font-black uppercase text-[var(--color-primary)]">
              {currentUser?.name || "MTShop"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={close}
            className="grid h-11 w-11 place-items-center border border-[var(--color-border)] text-[var(--color-primary)]"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-5">
          <div className="grid gap-2">
            {baseLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                className="flex min-h-12 items-center gap-3 border border-[var(--color-border)] px-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-primary)]"
              >
                {Icon ? <Icon size={18} /> : null}
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--color-border)] pt-5">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-secondary)]">Account</p>
            {currentUser ? (
              <div className="grid gap-2">
                {accountLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className="flex min-h-12 items-center gap-3 border border-[var(--color-border)] px-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-primary)]"
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                ))}
                {currentUser.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={close}
                    className="flex min-h-12 items-center border border-[var(--color-border)] px-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-primary)]"
                  >
                    Admin dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="min-h-12 border border-[var(--color-border)] px-4 text-left text-sm font-black uppercase tracking-[0.1em] text-[var(--color-accent-alt)]"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link
                  href="/Login"
                  onClick={close}
                  className="flex min-h-12 items-center gap-3 border border-[var(--color-border)] px-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-primary)]"
                >
                  <FiLogIn size={18} />
                  Login
                </Link>
                <Link
                  href="/Register"
                  onClick={close}
                  className="flex min-h-12 items-center border border-[var(--color-border)] px-4 text-sm font-black uppercase tracking-[0.1em] text-[var(--color-primary)]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="border-t border-[var(--color-border)] px-5 py-4">
          <ThemeToggle compact />
        </div>
      </aside>
    </>
  );
};

export default MobileMenu;
