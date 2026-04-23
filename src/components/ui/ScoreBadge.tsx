import { cn } from "@/utils/cn";

interface ScoreBadgeProps {
  score: string; // e.g. "2-0", "1-2"
  result: "victory" | "defeat" | "wo" | "pending";
  className?: string;
}

const resultStyles = {
  victory: "bg-green-900 text-green-100",
  defeat: "bg-clay-500 text-white",
  wo: "bg-gray-200 text-gray-500",
  pending: "bg-amber-100 text-amber-700",
};

export function ScoreBadge({ score, result, className }: ScoreBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-2 py-0.5 rounded font-bold text-sm min-w-[44px]",
        resultStyles[result],
        className
      )}
    >
      {score}
    </span>
  );
}
