"use client";

import { useState } from "react";

const items = [
  ["Description", "Clean modern fit, easy to style, and built for repeat wear. Pair it with cargos, denims, or layered outerwear."],
  ["Material & Care", "Machine wash cold. Do not bleach. Dry in shade. Iron on low heat if needed."],
  ["Shipping & Returns", "COD available. Easy 7-day returns on eligible products. Delivery timelines depend on pincode."],
];

const ProductAccordions = ({ description }: { description?: string }) => {
  const [open, setOpen] = useState("Description");

  return (
    <section className="mt-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
      {items.map(([title, body]) => (
        <div key={title} className="border-b border-[var(--color-border)] last:border-b-0">
          <button
            onClick={() => setOpen(open === title ? "" : title)}
            className="flex min-h-14 w-full items-center justify-between text-left text-sm font-black uppercase tracking-[0.12em] text-[var(--color-primary)]"
          >
            {title}
            <span>{open === title ? "-" : "+"}</span>
          </button>
          {open === title && (
            <div className="pb-5 text-sm leading-6 text-[var(--color-secondary)]">
              {title === "Description" ? description || body : body}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default ProductAccordions;
