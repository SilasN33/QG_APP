"use client";

import { PlayerContext } from "@/lib/hooks/useCurrentPlayer";
import type { Player } from "@/types";

export function PlayerProvider({
  player,
  children,
}: {
  player: Player | null;
  children: React.ReactNode;
}) {
  return (
    <PlayerContext.Provider value={{ player }}>
      {children}
    </PlayerContext.Provider>
  );
}
