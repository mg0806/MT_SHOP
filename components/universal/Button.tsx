"use client";

import { IconType } from "react-icons";

interface ButtonProps {
  lable: string;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  custom?: boolean;
  icon?: IconType;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}
const Button: React.FC<ButtonProps> = ({
  lable,
  disabled,
  outline,
  small,
  custom,
  icon: Icon,
  type = "button",
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
    w-full flex items-center justify-center gap-2
    transition uppercase tracking-[0.1em]
    border-[var(--color-accent)]
    ${outline ? "bg-transparent text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-bg)]" : "bg-[var(--color-accent)] text-[var(--color-bg)]"}
    ${
      small
        ? "text-xs font-semibold py-2 px-3 border"
        : "text-sm font-bold py-3 px-4 border-2"
    }
    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
    ${custom || ""}
  `}
    >
      {Icon && <Icon size={small ? 18 : 24} className="shrink-0" />}
      {lable}
    </button>
  );
};

export default Button;
