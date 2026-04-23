"use client";

import { Bell, Menu } from "lucide-react";
import Image from "next/image";
import { cn } from "@/utils/cn";

interface AppHeaderProps {
  transparent?: boolean;
  className?: string;
}

export function AppHeader({ transparent = false, className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14",
        transparent
          ? "bg-transparent"
          : "bg-green-900 border-b border-green-800",
        className
      )}
    >
      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-green-800/60 transition-colors">
        <Menu size={22} className="text-green-100" />
      </button>

      <div className="flex items-center gap-2">
        <Image
          src="/logo.svg"
          alt="QG Open"
          width={32}
          height={32}
          className="rounded-full"
          onError={() => {}}
        />
        <span className="text-green-100 font-bold text-sm tracking-wide">
          QG OPEN 2026
        </span>
      </div>

      <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-green-800/60 transition-colors relative">
        <Bell size={20} className="text-green-100" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-clay-500 rounded-full" />
      </button>
    </header>
  );
}
