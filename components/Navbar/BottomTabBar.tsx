"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { FiGrid, FiHome, FiMoon, FiShoppingBag, FiUser } from "react-icons/fi";
import { useCart } from "@/hooks/useCart";
import { useTheme } from "@/providers/themeProvider";

const tabs = [
  { href: "/", label: "Home", icon: FiHome },
  { href: "/", label: "Explore", icon: FiGrid },
  { href: "theme", label: "Theme", icon: FiMoon },
  { href: "/cart", label: "Cart", icon: FiShoppingBag },
  { href: "/account/profile", label: "Profile", icon: FiUser },
];

const BottomTabBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCategory = searchParams?.get("category");
  const { cartTotalQty } = useCart();
  const { toggleTheme } = useTheme();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1000] border-t border-[#34302a] bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom)] text-[#d8cdbc] backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active =
            label === "Explore"
              ? pathname === "/" && Boolean(activeCategory)
              : label === "Home"
                ? pathname === "/" && !activeCategory
                : pathname === href;
          return (
            <Link
              key={label}
              href={href === "theme" ? pathname || "/" : href}
              aria-label={label}
              onClick={(event) => {
                if (href === "theme") {
                  event.preventDefault();
                  toggleTheme();
                }
              }}
              className={`relative flex min-h-11 flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] transition ${
                active ? "text-white" : "text-[#b9ad9a] hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
              {label === "Cart" && cartTotalQty > 0 && (
                <span className="absolute right-5 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[9px] text-[#0a0a0a]">
                  {cartTotalQty}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
