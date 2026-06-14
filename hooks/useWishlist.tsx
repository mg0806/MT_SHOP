"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

type WishlistContextType = {
  wishlistIds: string[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  clearWishlist: () => void;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("MTShopWishlist");
    if (saved && saved !== "undefined") setWishlistIds(JSON.parse(saved));
    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.ids) {
          setWishlistIds(data.ids);
          localStorage.setItem("MTShopWishlist", JSON.stringify(data.ids));
        }
      })
      .catch(() => {});
  }, []);

  const persist = (ids: string[]) => {
    setWishlistIds(ids);
    localStorage.setItem("MTShopWishlist", JSON.stringify(ids));
  };

  const toggleWishlist = useCallback(
    (id: string) => {
      const exists = wishlistIds.includes(id);
      const next = exists
        ? wishlistIds.filter((item) => item !== id)
        : [...wishlistIds, id];
      persist(next);
      fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      }).catch(() => {});
      toast.success(exists ? "Removed from wishlist" : "Added to wishlist");
    },
    [wishlistIds],
  );

  const clearWishlist = useCallback(() => persist([]), []);
  const isWishlisted = useCallback((id: string) => wishlistIds.includes(id), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist, clearWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
