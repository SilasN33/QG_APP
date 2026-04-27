"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { useContextPanel, type PanelType } from "./ContextPanelProvider";
import { ScheduleMatchPanel } from "@/components/panels/ScheduleMatchPanel";

const PANEL_TITLES: Record<PanelType, string> = {
  "schedule-match": "Agendar Partida",
};

export function ContextPanel() {
  const { panel, closePanel } = useContextPanel();
  const isOpen = panel.type !== null;

  // Keep content mounted during the close animation (300ms)
  const [displayType, setDisplayType] = useState<PanelType | null>(panel.type);
  useEffect(() => {
    if (panel.type) {
      setDisplayType(panel.type);
    } else {
      const t = setTimeout(() => setDisplayType(null), 300);
      return () => clearTimeout(t);
    }
  }, [panel.type]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={closePanel}
        className={cn(
          "fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal={isOpen}
        className={cn(
          "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[70]",
          "bg-surface-1 border border-white/[0.07] border-b-0 rounded-t-3xl",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-0.5">
          <div className="w-9 h-1 rounded-full bg-white/10" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-white/[0.06]">
          <h2 className="font-display font-bold text-white text-base tracking-tight">
            {displayType ? PANEL_TITLES[displayType] : ""}
          </h2>
          <button
            onClick={closePanel}
            className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[78vh] overflow-y-auto overscroll-contain">
          {displayType === "schedule-match" && (
            <ScheduleMatchPanel onClose={closePanel} />
          )}
        </div>
      </div>
    </>
  );
}
