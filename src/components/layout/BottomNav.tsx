"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Trophy, Users, User, Settings } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCurrentPlayer } from "@/lib/hooks/useCurrentPlayer";

const baseNavItems = [
  { href: "/dashboard", label: "Início", Icon: Home },
  { href: "/calendario", label: "Jogos", Icon: Layers },
  { href: "/ranking", label: "Ranking", Icon: Trophy },
  { href: "/grupos", label: "Grupos", Icon: Users },
  { href: "/perfil", label: "Perfil", Icon: User },
];

const adminNavItem = { href: "/admin", label: "Admin", Icon: Settings };

export function BottomNav() {
  const pathname = usePathname();
  const player = useCurrentPlayer();
  const navItems = player?.is_admin ? [...baseNavItems, adminNavItem] : baseNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="max-w-md mx-auto flex items-stretch">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors",
                active ? "text-clay-500" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(active && "text-clay-500")}
              />
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide",
                  active ? "text-clay-500" : "text-gray-400"
                )}
              >
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-clay-500 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
