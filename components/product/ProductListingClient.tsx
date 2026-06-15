"use client";

import { useMemo, useState } from "react";
import { FiFilter, FiSliders, FiX } from "react-icons/fi";
import ProductCard from "@/components/Products/ProductCard";
import ProductSkeleton from "@/components/common/Skeleton";

type ProductListingClientProps = {
  products: any[];
  title: string;
  category?: string;
};

const sortOptions = ["Newest", "Price: Low to High", "Best Selling", "Rating"];

const normalizeFilterValue = (value: string) => value.trim().toLowerCase();

const ProductListingClient = ({ products, title, category }: ProductListingClientProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(category || "All");
  const [price, setPrice] = useState("All");
  const [size, setSize] = useState("All");
  const [color, setColor] = useState("All");
  const [sort, setSort] = useState(sortOptions[0]);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))],
    [products],
  );
  const sizes = ["All", "S", "M", "L", "XL", "XXL"];
  const colors = useMemo(() => {
    const values = products.flatMap((product) =>
      Array.isArray(product.images)
        ? product.images.map((item: any) => item.color).filter(Boolean)
        : [],
    );
    return ["All", ...Array.from(new Set(values))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All") {
      const normalizedActiveCategory = normalizeFilterValue(activeCategory);
      result = result.filter(
        (product) => normalizeFilterValue(String(product.category || "")) === normalizedActiveCategory,
      );
    }
    if (price === "Under Rs.1000") {
      result = result.filter((product) => Number(product.finalPrice ?? product.price) < 1000);
    }
    if (price === "Rs.1000 - Rs.2500") {
      result = result.filter((product) => {
        const amount = Number(product.finalPrice ?? product.price);
        return amount >= 1000 && amount <= 2500;
      });
    }
    if (price === "Above Rs.2500") {
      result = result.filter((product) => Number(product.finalPrice ?? product.price) > 2500);
    }
    if (size !== "All") {
      result = result.filter((product) => {
        const productSizes = product.availableSizes || product.sizes || product.size;
        if (!productSizes) return true;
        return Array.isArray(productSizes) ? productSizes.includes(size) : String(productSizes).includes(size);
      });
    }
    if (color !== "All") {
      result = result.filter((product) =>
        Array.isArray(product.images)
          ? product.images.some((item: any) => item.color === color)
          : false,
      );
    }
    if (sort === "Price: Low to High") {
      result.sort((a, b) => Number(a.finalPrice ?? a.price) - Number(b.finalPrice ?? b.price));
    }
    if (sort === "Rating") {
      result.sort((a, b) => (b.reviews?.length || 0) - (a.reviews?.length || 0));
    }

    return result;
  }, [activeCategory, color, price, products, size, sort]);

  const applyWithSkeleton = (callback: () => void) => {
    setLoading(true);
    callback();
    window.setTimeout(() => setLoading(false), 300);
  };

  const filterButtonClass = (active: boolean) =>
    `min-h-10 border px-4 text-xs font-black uppercase tracking-[0.12em] transition ${
      active
        ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
        : "border-[var(--color-border)] text-[var(--color-primary)] hover:border-[var(--color-accent)]"
    }`;

  const filterPanel = (
    <div className="space-y-7">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          Size
        </p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((item) => (
            <button
              key={item}
              onClick={() => applyWithSkeleton(() => setSize(item))}
              className={filterButtonClass(size === item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          Color
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((item) => (
            <button
              key={item}
              onClick={() => applyWithSkeleton(() => setColor(item))}
              className={filterButtonClass(color === item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          Category
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => applyWithSkeleton(() => setActiveCategory(item))}
              className={filterButtonClass(activeCategory === item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-secondary)]">
          Price
        </p>
        <div className="grid gap-2">
          {["All", "Under Rs.1000", "Rs.1000 - Rs.2500", "Above Rs.2500"].map((item) => (
            <button
              key={item}
              onClick={() => applyWithSkeleton(() => setPrice(item))}
              className={`min-h-10 border px-4 text-left text-xs font-black uppercase tracking-[0.12em] transition ${
                price === item
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-primary)] hover:border-[var(--color-accent)]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-3 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-7 border-b border-[var(--color-border)] pb-7">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-accent)]">
            Latest collection
          </p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-black uppercase leading-none text-[var(--color-primary)] sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-[var(--color-secondary)] sm:text-base">
                Fresh shirts, co-ords, cargos and everyday statement pieces.
              </p>
            </div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-secondary)]">
              {filteredProducts.length} styles
            </p>
          </div>
        </div>

        <div className="sticky top-[138px] z-20 mb-6 flex items-center justify-between gap-3 border-y border-[var(--color-border)] bg-[var(--color-bg)]/95 py-3 backdrop-blur-xl sm:top-[146px] lg:top-[112px] lg:mb-8">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex min-h-11 items-center gap-2 border border-[var(--color-border)] px-4 text-xs font-black uppercase tracking-[0.12em] transition hover:border-[var(--color-accent)] lg:hidden"
          >
            <FiFilter /> Filter
          </button>

          <div className="hidden min-w-0 flex-1 gap-2 overflow-x-auto lg:flex">
            {[`Size: ${size}`, `Color: ${color}`, `Price: ${price}`, `Category: ${activeCategory}`].map((chip) => (
              <button
                key={chip}
                className="min-h-10 shrink-0 border border-[var(--color-border)] px-4 text-[11px] font-black uppercase tracking-[0.12em] text-[var(--color-secondary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-primary)]"
              >
                {chip}
              </button>
            ))}
          </div>

          <label className="flex min-w-0 items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-secondary)]">
            <FiSliders />
            <select
              value={sort}
              onChange={(event) => applyWithSkeleton(() => setSort(event.target.value))}
              className="h-11 min-w-0 max-w-[170px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[var(--color-primary)] sm:max-w-none"
            >
              {sortOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden lg:block">{filterPanel}</aside>
          <main>
            {loading ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 xl:gap-y-9 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="grid min-h-[360px] place-items-center border border-[var(--color-border)] bg-[var(--color-surface)] text-center">
                <div>
                  <h2 className="text-3xl font-black uppercase">Nothing found</h2>
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setPrice("All");
                      setSize("All");
                      setColor("All");
                    }}
                    className="mt-4 bg-[var(--color-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)]"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 md:grid-cols-3 xl:gap-y-9 2xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} data={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-[1100] bg-[var(--color-overlay)] transition lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 z-[1101] h-dvh w-[88vw] max-w-sm overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg)] p-5 transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase tracking-[0.14em]">Filters</h2>
          <button
            aria-label="Close filters"
            className="grid min-h-11 min-w-11 place-items-center border border-[var(--color-border)]"
            onClick={() => setDrawerOpen(false)}
          >
            <FiX />
          </button>
        </div>
        {filterPanel}
      </aside>
    </div>
  );
};

export default ProductListingClient;
