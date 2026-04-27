"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type PanelType = "schedule-match";

interface PanelState {
  type: PanelType | null;
  data?: unknown;
}

interface ContextPanelContextValue {
  panel: PanelState;
  openPanel: (type: PanelType, data?: unknown) => void;
  closePanel: () => void;
}

const ContextPanelContext = createContext<ContextPanelContextValue | null>(null);

export function ContextPanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<PanelState>({ type: null });

  const openPanel = (type: PanelType, data?: unknown) => setPanel({ type, data });
  const closePanel = () => setPanel({ type: null });

  return (
    <ContextPanelContext.Provider value={{ panel, openPanel, closePanel }}>
      {children}
    </ContextPanelContext.Provider>
  );
}

export function useContextPanel() {
  const ctx = useContext(ContextPanelContext);
  if (!ctx) throw new Error("useContextPanel must be inside ContextPanelProvider");
  return ctx;
}
