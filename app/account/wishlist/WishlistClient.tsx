"use client";

import ProductCard from "@/components/Products/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { useEffect, useState } from "react";

const WishlistClient = () => {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const server = await fetch("/api/wishlist");
      if (server.ok) {
        const data = await server.json();
        if (data.products) {
          setProducts(data.products);
          return;
        }
      }
      const data = await Promise.all(
        wishlistIds.map(async (id) => {
          const res = await fetch(`/api/products/${id}`);
          return res.ok ? res.json() : null;
        }),
      );
      setProducts(data.filter(Boolean));
    };
    load();
  }, [wishlistIds]);

  return (
    <div className="px-4 py-10 sm:px-8">
      <h1 className="text-5xl font-black uppercase">Wishlist</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((product) => <ProductCard key={product.id} data={product} />)}
      </div>
      {products.length === 0 && <p className="mt-8 text-[var(--color-secondary)]">No saved products yet.</p>}
    </div>
  );
};

export default WishlistClient;
