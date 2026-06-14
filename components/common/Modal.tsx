"use client";

import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

const Modal = ({ open, title, children, onClose }: ModalProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center bg-[var(--color-overlay)] p-0 md:items-center md:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-dvh w-full overflow-y-auto border border-[var(--color-border)] bg-[var(--color-bg)] p-5 text-[var(--color-primary)] md:max-w-2xl md:p-6"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-black uppercase tracking-[0.12em]">{title}</h2>
          <button
            ref={closeRef}
            aria-label="Close modal"
            onClick={onClose}
            className="grid min-h-11 min-w-11 place-items-center border border-[var(--color-border)]"
          >
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
