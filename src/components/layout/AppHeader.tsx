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
        // Em md+, o header começa onde o sidebar termina
        "fixed top-0 left-0 md:left-16 lg:left-60 right-0 z-30 h-14 flex items-center",
        transparent
          ? "bg-transparent"
          : "bg-surface-1/85 backdrop-blur-xl border-b border-white/[0.06]",
        className
      )}
    >
      <div className="w-full flex items-center px-4 max-w-md mx-auto md:max-w-none">
        {/* Logo — exibido só no mobile; sidebar cuida do branding em md+ */}
        <div className="flex md:hidden items-center gap-2.5">
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
