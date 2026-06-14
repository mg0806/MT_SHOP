"use client";

import Avatar from "@/components/universal/Avatar";
import Image from "next/image";
import moment from "moment";
import { useMemo, useState } from "react";
import { FaStar } from "react-icons/fa";

const StarDisplay = ({ value, size = 18 }: { value: number; size?: number }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <FaStar
        key={star}
        size={size}
        className={star <= Math.round(value) ? "text-[var(--color-accent)]" : "text-[var(--color-border)]"}
      />
    ))}
  </div>
);

const Listrating = ({ product }: { product: any }) => {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const reviews = product.reviews || [];
  const average =
    reviews.length > 0
      ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length
      : 0;

  const filtered = useMemo(() => {
    if (filter === "All") return reviews;
    return reviews.filter((review: any) => review.rating === Number(filter[0]));
  }, [filter, reviews]);

  if (reviews.length === 0) return null;

  const voteHelpful = async (id: string, vote: "yes" | "no") => {
    await fetch(`/api/reviews/${id}/helpful`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote }),
    });
  };

  return (
    <section id="reviews" className="mt-16 border-t border-[var(--color-border)] pt-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="fashion-kicker">Customer Reviews</p>
          <h2 className="mt-2 text-4xl font-black uppercase">Customer Reviews</h2>
        </div>
        <div className="text-left md:text-right">
          <p className="text-5xl font-black">{average.toFixed(1)}</p>
          <div className="mt-2 flex justify-start md:justify-end">
            <StarDisplay value={average} size={22} />
          </div>
          <p className="text-sm text-[var(--color-secondary)]">{reviews.length} reviews</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {["All", "5★", "4★", "3★", "2★", "1★"].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded-full border px-4 py-2 text-xs font-black uppercase ${
              filter === item
                ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-bg)]"
                : "border-[var(--color-border)] text-[var(--color-primary)]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.map((review: any) => {
          const isExpanded = expanded.includes(review.id);
          return (
            <article key={review.id} className="border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <StarDisplay value={review.rating} />
              <h3 className="mt-3 font-black uppercase">Verified fit review</h3>
              <p className={`mt-2 text-sm leading-6 text-[var(--color-secondary)] ${isExpanded ? "" : "line-clamp-3"}`}>
                {review.comment}
              </p>
              <button
                onClick={() =>
                  setExpanded((prev) =>
                    prev.includes(review.id)
                      ? prev.filter((item) => item !== review.id)
                      : [...prev, review.id],
                  )
                }
                className="mt-2 text-xs font-black uppercase text-[var(--color-accent)]"
              >
                {isExpanded ? "Read less" : "Read more"}
              </button>
              <div className="mt-4 flex items-center gap-3">
                <Avatar src={review.user?.image} />
                <div>
                  <p className="text-sm font-bold">{review.user?.name || "Customer"}</p>
                  <p className="text-xs text-[var(--color-secondary)]">
                    Verified Purchase - {moment(review.createdDate).fromNow()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {(Array.isArray(review.photos) ? review.photos : []).map((photo: string, index: number) => (
                  <button
                    key={photo}
                    onClick={() => setLightbox(photo)}
                    className="relative h-14 w-14 overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg)] text-xs"
                  >
                    <Image src={photo} alt={`Review photo ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--color-secondary)]">
                Was this helpful?{" "}
                <button onClick={() => voteHelpful(review.id, "yes")} className="text-[var(--color-primary)]">
                  Yes ({review.helpfulYes || 0})
                </button>{" "}
                <button onClick={() => voteHelpful(review.id, "no")} className="text-[var(--color-primary)]">
                  No ({review.helpfulNo || 0})
                </button>
              </p>
            </article>
          );
        })}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-[1200] grid place-items-center bg-[var(--color-overlay)] p-6" onClick={() => setLightbox(null)}>
          <div className="relative h-[70vh] w-full max-w-3xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            <Image src={lightbox} alt="Review photo preview" fill className="object-contain" />
            <button className="mt-4 text-xs font-black uppercase text-[var(--color-accent)]">Close</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Listrating;
