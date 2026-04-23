"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  showBack = false,
  action,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-3 bg-green-900 border-b border-green-800",
        className
      )}
    >
      {showBack ? (
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center -ml-1 text-green-100"
        >
          <ChevronLeft size={22} />
        </button>
      ) : (
        <div className="w-8" />
      )}
      <h1 className="font-bold text-green-50 text-base tracking-wide uppercase">
        {title}
      </h1>
      <div className="w-8 flex justify-end">{action}</div>
    </div>
  );
}
