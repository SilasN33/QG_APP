import { cn } from "@/utils/cn";

type BadgeVariant = "victory" | "defeat" | "wo" | "pending" | "group" | "info";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  victory: "bg-green-900 text-green-100 border border-green-700",
  defeat: "bg-clay-500 text-white",
  wo: "bg-gray-200 text-gray-600",
  pending: "bg-amber-100 text-amber-700 border border-amber-300",
  group: "bg-green-900 text-green-100",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold tracking-wide uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
