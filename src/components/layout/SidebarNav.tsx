"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Layers, Trophy, Users, User,
  Settings, CalendarPlus, GitBranch,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useCurrentPlayer } from "@/lib/hooks/useCurrentPlayer";
import { useContextPanel } from "./ContextPanelProvider";

const navItems = [
  { href: "/dashboard",   label: "Início",      Icon: Home },
  { href: "/calendario",  label: "Jogos",        Icon: Layers },
  { href: "/ranking",     label: "Ranking",      Icon: Trophy },
  { href: "/grupos",      label: "Grupos",       Icon: Users },
  { href: "/chaveamento", label: "Chaveamento",  Icon: GitBranch },
  { href: "/perfil",      label: "Perfil",       Icon: User },
];

const adminItem = { href: "/admin", label: "Admin", Icon: Settings };

export function SidebarNav() {
  const pathname    = usePathname();
  const player      = useCurrentPlayer();
  const { openPanel } = useContextPanel();
  const items       = player?.is_admin ? [...navItems, adminItem] : navItems;

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col",
        "fixed left-0 top-0 bottom-0 z-40",
        "w-16 lg:w-60",
        "bg-surface-0 border-r border-white/[0.06]"
      )}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 lg:px-4 border-b border-white/[0.06] shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-lime-500 flex items-center justify-center shrink-0 shadow-glow">
            <span className="font-display font-bold text-[11px] text-surface-0 tracking-tight leading-none">
              QG
            </span>
          </div>
          <span className="hidden lg:block font-display font-bold text-white/90 text-sm tracking-wide truncate">
            QG OPEN <span className="text-lime-500">2026</span>
          </span>
        </Link>
      </div>

      {/* Agendar CTA */}
      <div className="px-2 lg:px-3 pt-4 pb-2 shrink-0">
        <button
          onClick={() => openPanel("schedule-match")}
          className={cn(
            "w-full flex items-center justify-center lg:justify-start gap-2.5",
            "bg-lime-500 hover:bg-lime-400 active:scale-95 transition-all rounded-xl",
            "h-10 lg:px-3 shadow-glow"
          )}
        >
          <CalendarPlus size={17} className="text-surface-0 shrink-0" />
          <span className="hidden lg:block text-surface-0 font-bold text-sm">
            Agendar Partida
          </span>
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 lg:px-3 py-2 space-y-0.5 overflow-y-auto">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={cn(
                "relative flex items-center justify-center lg:justify-start gap-3",
                "h-10 lg:h-auto lg:px-3 lg:py-2.5 rounded-xl",
                "transition-all duration-150",
                active
                  ? "bg-white/[0.07]"
                  : "hover:bg-white/[0.04]"
              )}
            >
              {/* Active indicator — right edge on icon-rail, hidden on full sidebar */}
              {active && (
                <span className="lg:hidden absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-lime-500 rounded-l-full" />
              )}

              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 1.8}
                className={cn(
                  "shrink-0 transition-colors",
                  active ? "text-lime-500" : "text-white/35"
                )}
              />
              <span
                className={cn(
                  "hidden lg:block text-sm font-semibold transition-colors",
                  active ? "text-white/90" : "text-white/50"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User info — bottom */}
      {player && (
        <div className="px-2 lg:px-3 py-4 border-t border-white/[0.06] shrink-0">
          <Link
            href="/perfil"
            title={player.name}
            className="flex items-center gap-3 rounded-xl h-10 lg:h-auto lg:p-2.5 justify-center lg:justify-start hover:bg-white/[0.04] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-green-900 border border-lime-500/20 flex items-center justify-center shrink-0">
              <span className="text-lime-500 font-display font-bold text-xs leading-none">
                {player.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-white/80 text-sm font-semibold truncate leading-tight">
                {player.name}
              </p>
              {player.group_letter && (
                <p className="text-white/30 text-xs">Grupo {player.group_letter}</p>
              )}
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
