"use client";

import { useRouter } from "next/navigation";
import { MdArrowBack, MdArrowForward } from "react-icons/md";

const AdminHistoryControls = () => {
  const router = useRouter();

  return (
    <div className="fixed left-4 top-28 z-[1100] flex overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_16px_45px_rgba(0,0,0,0.18)] md:left-6 md:top-32">
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        title="Back"
        className="grid h-11 w-11 place-items-center border-r border-[var(--color-border)] text-[var(--color-primary)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
      >
        <MdArrowBack size={21} />
      </button>
      <button
        onClick={() => window.history.forward()}
        aria-label="Go forward"
        title="Forward"
        className="grid h-11 w-11 place-items-center text-[var(--color-primary)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]"
      >
        <MdArrowForward size={21} />
      </button>
    </div>
  );
};

export default AdminHistoryControls;
