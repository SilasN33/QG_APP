import { cn } from "@/utils/cn";

type BadgeVariant = "victory" | "defeat" | "wo" | "pending" | "group" | "info";

interface BadgeProps {
  variant:   BadgeVariant;
  children:  React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  victory: "bg-lime-500/15 text-lime-400 border border-lime-500/30",
  defeat:  "bg-red-500/15  text-red-400  border border-red-500/25",
  wo:      "bg-white/[0.06] text-white/35 border border-white/[0.08]",
  pending: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  group:   "bg-surface-3 text-white/50 border border-white/[0.08]",
  info:    "bg-blue-500/15  text-blue-400 border border-blue-500/25",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
