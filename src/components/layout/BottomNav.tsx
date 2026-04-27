"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Trophy, Users, User, Settings } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCurrentPlayer } from "@/lib/hooks/useCurrentPlayer";

const baseNavItems = [
  { href: "/dashboard", label: "Início",  Icon: Home },
  { href: "/calendario", label: "Jogos",  Icon: Layers },
  { href: "/ranking",   label: "Ranking", Icon: Trophy },
  { href: "/grupos",    label: "Grupos",  Icon: Users },
  { href: "/perfil",    label: "Perfil",  Icon: User },
];

const adminNavItem = { href: "/admin", label: "Admin", Icon: Settings };

export function BottomNav() {
  const pathname = usePathname();
  const player   = useCurrentPlayer();
  const navItems = player?.is_admin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-5 px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center h-[62px] bg-surface-3/95 backdrop-blur-2xl shadow-nav rounded-[22px] border border-white/[0.09] px-1.5 gap-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3.5 py-2 rounded-xl transition-all duration-200",
                active
                  ? "bg-white/[0.07]"
                  : "hover:bg-white/[0.04]"
              )}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(
                  "transition-colors duration-200",
                  active ? "text-lime-500" : "text-white/30"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-semibold tracking-wide uppercase transition-colors duration-200",
                  active ? "text-lime-500" : "text-white/30"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
