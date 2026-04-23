"use client";

import { createContext, useContext } from "react";
import type { Player } from "@/types";

export interface PlayerContextValue {
  player: Player | null;
}

export const PlayerContext = createContext<PlayerContextValue>({ player: null });

export function useCurrentPlayer() {
  return useContext(PlayerContext).player;
}
