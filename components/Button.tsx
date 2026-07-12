import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "focus-ring rounded-full px-6 py-3 text-sm font-semibold transition disabled:opacity-50",
        variant === "primary" && "bg-accent text-white hover:bg-accent-dark",
        variant === "secondary" &&
          "border border-white/10 bg-transparent text-white hover:bg-white/5",
        variant === "ghost" && "bg-transparent text-text-secondary hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
