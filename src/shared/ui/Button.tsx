import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ children, variant = "primary", className = "", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-rust text-ivory shadow-lg shadow-rust/20 hover:bg-[#873f33]",
    secondary: "bg-teal text-ivory hover:bg-[#385754]",
    ghost: "border border-graphite/30 bg-ivory/50 text-graphite hover:bg-ivory"
  };
  return (
    <button
      className={`min-h-11 rounded-xl px-4 py-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
