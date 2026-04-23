import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant;
  size?:     ButtonSize;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-lime-500 hover:bg-lime-400 text-surface-0 font-bold shadow-sm active:scale-95",
  secondary:
    "bg-surface-3 hover:bg-surface-4 text-white/80 border border-white/[0.08] active:scale-95",
  ghost:
    "bg-transparent hover:bg-white/[0.06] text-white/70",
  outline:
    "bg-transparent border border-white/[0.14] text-white/70 hover:border-white/25 hover:bg-white/[0.04]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function Button({
  variant  = "primary",
  size     = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        props.disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
