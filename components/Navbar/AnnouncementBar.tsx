"use client";

const message =
  "Free delivery on orders above Rs.999 | Easy 7-day returns | COD available";

const AnnouncementBar = () => {
  return (
    <div className="h-9 overflow-hidden bg-[var(--color-accent)] text-[var(--color-bg)]">
      <div className="marquee-track flex h-full w-max items-center whitespace-nowrap text-xs font-black uppercase tracking-[0.16em]">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="mx-6">
            {message}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
