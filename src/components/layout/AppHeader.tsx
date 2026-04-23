"use client";

import { cn } from "@/utils/cn";

interface AppHeaderProps {
  transparent?: boolean;
  className?: string;
}

export function AppHeader({ transparent = false, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 h-14 flex items-center",
        transparent
          ? "bg-transparent"
          : "bg-surface-1/85 backdrop-blur-xl border-b border-white/[0.06]",
        className
      )}
    >
      <div className="max-w-md mx-auto w-full flex items-center px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-lime-500 flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-[11px] text-surface-0 tracking-tight leading-none">
              QG
            </span>
          </div>
          <span className="font-display font-bold text-white/90 text-sm tracking-wide">
            QG OPEN <span className="text-lime-500">2026</span>
          </span>
        </div>
      </div>
    </header>
  );
}
