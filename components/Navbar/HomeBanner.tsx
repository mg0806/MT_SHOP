"use client";
import { useEffect, useState } from "react";

export default function HomeBanner() {
  const [banner, setBanner] = useState<any>(null);

  useEffect(() => {
    fetch("/api/banner")
      .then((res) => res.json())
      .then((data) => setBanner(data));
  }, []);

  if (!banner) return null;

  return (
    <section
      className="relative min-h-[calc(100vh-120px)] overflow-hidden bg-[var(--color-bg)]"
      style={{
        backgroundImage: banner.bannerImage
          ? `url(${banner.bannerImage})`
          : "linear-gradient(135deg, #0d0d0d 0%, #1f1f1f 48%, #3b3b10 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
      <div className="relative mx-auto flex min-h-[calc(100vh-120px)] flex-col items-start justify-end gap-6 px-5 py-14 sm:px-10 md:py-20">
        <div className="text-left max-w-3xl text-white">
          <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            New Collection - SS2025
          </p>
          <h1 className="text-5xl font-black uppercase leading-[0.9] sm:text-6xl md:text-8xl">
            {banner.titleLine1 || "Modern Fits"}
          </h1>

          <h1 className="mt-2 text-5xl font-black uppercase leading-[0.9] sm:text-6xl md:text-8xl">
            {banner.titleLine2 || "For Everyday Style"}
          </h1>

          <p className="mt-6 max-w-2xl text-base text-[var(--color-secondary)] sm:text-lg md:text-xl">
            {banner.subtitle || "Sharp shirts, clean layers, and wardrobe essentials curated for a premium street-to-smart look."}
          </p>

          <p className="mt-6 inline-flex h-12 items-center bg-[var(--color-accent)] px-7 text-sm font-black uppercase tracking-[0.14em] text-[var(--color-bg)]">
            {banner.offerText || "Shop the drop"}
          </p>
        </div>
      </div>
    </section>
  );
}
