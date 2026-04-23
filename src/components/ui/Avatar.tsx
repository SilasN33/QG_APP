import { cn } from "@/utils/cn";
import Image from "next/image";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const imgSizes = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const avatarUrl =
    src ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1C4A35&color=D1EDD9&bold=true&size=${imgSizes[size] * 2}`;

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-green-900 flex items-center justify-center shrink-0",
        sizes[size],
        className
      )}
    >
      <Image
        src={avatarUrl}
        alt={name}
        fill
        className="object-cover"
        sizes={`${imgSizes[size]}px`}
        onError={() => {}}
      />
      <span className="absolute font-bold text-green-100 select-none">
        {initials}
      </span>
    </div>
  );
}
