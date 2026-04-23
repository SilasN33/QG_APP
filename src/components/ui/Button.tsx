import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-clay-500 hover:bg-clay-600 text-white shadow-sm active:scale-95",
  secondary:
    "bg-green-900 hover:bg-green-800 text-green-100 shadow-sm active:scale-95",
  ghost: "bg-transparent hover:bg-green-800/40 text-green-100",
  outline:
    "bg-transparent border border-green-700 text-green-100 hover:bg-green-800/30",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
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
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
