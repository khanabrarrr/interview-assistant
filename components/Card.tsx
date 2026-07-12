import { ReactNode } from "react";
import clsx from "clsx";

export default function Card({
  children,
  className,
  glass = false,
}: {
  children: ReactNode;
  className?: string;
  glass?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-xl2 border border-white/5 p-6 shadow-glass",
        glass ? "glass" : "bg-card",
        className
      )}
    >
      {children}
    </div>
  );
}
