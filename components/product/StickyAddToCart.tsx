"use client";

import { useEffect, useState } from "react";

const StickyAddToCart = ({
  productName,
  disabled,
  onAdd,
}: {
  productName: string;
  disabled?: boolean;
  onAdd: () => void;
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-16 z-[999] border-t border-[var(--color-border)] bg-[var(--color-bg)] p-3 transition-transform md:hidden ${
        show ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center gap-3">
        <p className="min-w-0 flex-1 truncate text-xs font-bold uppercase">{productName}</p>
        <button
          disabled={disabled}
          onClick={onAdd}
          className="min-h-11 bg-[var(--color-accent)] px-4 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-bg)] disabled:opacity-50"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default StickyAddToCart;
