import { cn } from "@/utils/cn";

interface CardProps {
  children:  React.ReactNode;
  className?: string;
  padding?:  "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-5",
};

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-surface-2 rounded-2xl shadow-card border border-white/[0.06]",
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title:     string;
  action?:   React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-3", className)}>
      <h3 className="font-display font-bold text-white/35 text-[10px] uppercase tracking-widest">
        {title}
      </h3>
      {action}
    </div>
  );
}
