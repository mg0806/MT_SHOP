"use client";

type BrandLoaderProps = {
  label?: string;
};

const BrandLoader = ({ label = "Loading" }: BrandLoaderProps) => {
  return (
    <div className="fixed left-0 top-0 z-[1200] flex h-[100dvh] w-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative grid h-28 w-28 place-items-center border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="absolute inset-2 border border-[var(--color-accent)]/35" />
          <div className="brand-loader-ring absolute h-24 w-24 border border-transparent border-t-[var(--color-accent)] border-r-[var(--color-accent)]" />
          <div className="font-black uppercase tracking-[0.18em] text-[var(--color-primary)]">
            <span className="text-4xl leading-none">M</span>
            <span className="text-4xl leading-none text-[var(--color-accent)]">T</span>
          </div>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--color-secondary)]">
          {label}
        </p>
      </div>
    </div>
  );
};

export default BrandLoader;
