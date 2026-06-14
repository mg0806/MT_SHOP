"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "New Arrivals", href: "/new-arrivals" },
];

const NavLinks = () => {
  const pathname = usePathname() || "/";

  return (
    <nav className="hidden items-center justify-center gap-7 lg:flex">
      {navItems.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-b-2 py-2 text-xs font-black uppercase tracking-[0.18em] transition hover:text-[var(--color-accent)] ${
              active
                ? "border-[var(--color-accent)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-secondary)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};

export default NavLinks;
