"use client";

import { type ElementType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Trophy, User, Settings, Plus } from "lucide-react";
import { cn } from "@/utils/cn";
import { useCurrentPlayer } from "@/lib/hooks/useCurrentPlayer";
import { useContextPanel } from "./ContextPanelProvider";

const leftItems = [
  { href: "/dashboard", label: "Início",  Icon: Home },
  { href: "/calendario", label: "Jogos",  Icon: Layers },
];

const rightItems = [
  { href: "/ranking", label: "Ranking", Icon: Trophy },
  { href: "/perfil",  label: "Perfil",  Icon: User },
];

const adminItem = { href: "/admin", label: "Admin", Icon: Settings };

export function BottomNav() {
  const pathname      = usePathname();
  const player        = useCurrentPlayer();
  const { openPanel, panel } = useContextPanel();

  const isPanelOpen = panel.type !== null;

  const allRight = player?.is_admin
    ? [...rightItems, adminItem]
    : rightItems;

  function NavLink({ href, label, Icon }: { href: string; label: string; Icon: ElementType }) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className="flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-xl transition-all duration-200"
      >
        <Icon
          size={20}
          strokeWidth={active ? 2.5 : 1.8}
          className={cn(
            "transition-colors duration-200",
            active ? "text-lime-500" : "text-white/35"
          )}
        />
        <span className={cn(
          "text-[9px] font-semibold tracking-wide uppercase transition-colors duration-200",
          active ? "text-lime-500" : "text-white/30"
        )}>
          {label}
        </span>
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
        isPanelOpen ? "translate-y-full" : "translate-y-0"
      )}
    >
      <div className="flex justify-center pb-5 px-4">
        <nav className="flex items-center w-full max-w-sm h-[62px] bg-surface-3/95 backdrop-blur-2xl shadow-nav rounded-[22px] border border-white/[0.09] px-2">
          {/* Left items */}
          {leftItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}

          {/* Center FAB */}
          <div className="flex items-center justify-center flex-shrink-0 px-2">
            <button
              onClick={() => openPanel("schedule-match")}
              className="w-12 h-12 -mt-5 rounded-2xl bg-lime-500 hover:bg-lime-400 active:scale-90 transition-all duration-150 flex items-center justify-center shadow-glow border-2 border-surface-3"
            >
              <Plus size={22} className="text-surface-0" strokeWidth={2.5} />
            </button>
          </div>

          {/* Right items */}
          {allRight.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </div>
    </div>
  );
}
