"use client";

import { useTheme } from "@/providers/themeProvider";
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeToggle = ({ compact = false }: { compact?: boolean }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
      onClick={toggleTheme}
      className={`inline-flex h-11 items-center justify-center border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] ${
        compact ? "w-11" : "gap-2 px-4"
      }`}
    >
      {isLight ? <FiMoon size={18} /> : <FiSun size={18} />}
      {!compact && (
        <span className="text-[11px] font-black uppercase tracking-[0.14em]">
          {isLight ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
