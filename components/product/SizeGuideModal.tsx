"use client";

import { useState } from "react";
import Modal from "@/components/common/Modal";

const cmRows = [
  ["S", "96", "78", "94", "70"],
  ["M", "101", "83", "99", "72"],
  ["L", "106", "88", "104", "74"],
  ["XL", "111", "93", "109", "76"],
  ["XXL", "116", "98", "114", "78"],
];

const SizeGuideModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [unit, setUnit] = useState<"CM" | "IN">("CM");
  const rows =
    unit === "CM"
      ? cmRows
      : cmRows.map(([size, ...values]) => [
          size,
          ...values.map((value) => (Number(value) / 2.54).toFixed(1)),
        ]);

  return (
    <Modal open={open} onClose={onClose} title="Size Guide">
      <div className="mb-5 inline-flex border border-[var(--color-border)]">
        {["CM", "IN"].map((item) => (
          <button
            key={item}
            onClick={() => setUnit(item as "CM" | "IN")}
            className={`min-h-11 px-5 text-xs font-black uppercase ${
              unit === item
                ? "bg-[var(--color-accent)] text-[var(--color-bg)]"
                : "text-[var(--color-primary)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead className="bg-[var(--color-surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--color-secondary)]">
            <tr>{["Size", "Chest", "Waist", "Hip", "Length"].map((head) => <th key={head} className="border border-[var(--color-border)] p-3">{head}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row[0]}>
                {row.map((cell) => (
                  <td key={cell} className="border border-[var(--color-border)] p-3 font-mono">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-[160px_1fr]">
        <svg viewBox="0 0 120 160" className="h-40 w-32 text-[var(--color-accent)]">
          <path d="M40 20h40l16 24-14 10-8-13v94H46V41l-8 13-14-10z" fill="none" stroke="currentColor" strokeWidth="4" />
          <path d="M32 70h56M42 96h36" stroke="currentColor" strokeWidth="3" />
        </svg>
        <div className="text-sm leading-6 text-[var(--color-secondary)]">
          <p className="font-bold text-[var(--color-primary)]">How to measure</p>
          <p>Measure chest around the fullest part, waist at the natural waistline, and length from shoulder to hem.</p>
        </div>
      </div>
    </Modal>
  );
};

export default SizeGuideModal;
