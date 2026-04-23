"use client";

import { useState, useMemo } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths,
  startOfWeek, endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Match } from "@/types";

type FilterType = "todos" | "grupos" | "quartas" | "semi" | "final";

const FILTERS: { key: FilterType; label: string; color: string }[] = [
  { key: "todos", label: "Todos", color: "bg-gray-500" },
  { key: "grupos", label: "Grupos", color: "bg-green-700" },
  { key: "quartas", label: "Quartas", color: "bg-blue-500" },
  { key: "semi", label: "Semi", color: "bg-amber-500" },
  { key: "final", label: "Final", color: "bg-clay-500" },
];

function phaseToFilter(phase: string): FilterType {
  if (phase === "group") return "grupos";
  if (phase.includes("quarterfinals")) return "quartas";
  if (phase.includes("semifinals")) return "semi";
  if (phase.includes("final")) return "final";
  return "todos";
}

const PHASE_LABEL: Record<string, string> = {
  group: "Grupo",
  quarterfinals: "Quartas",
  semifinals: "Semifinais",
  final: "Final",
  consolation_quarterfinals: "Consol. Quartas",
  consolation_semifinals: "Consol. Semi",
  consolation_final: "Consol. Final",
};

interface Props { allMatches: Match[] }

export function CalendarioClient({ allMatches }: Props) {
  // Default to first month with matches or current month
  const firstMatchDate = allMatches.find((m) => m.scheduled_at)?.scheduled_at;
  const defaultMonth = firstMatchDate ? new Date(firstMatchDate) : new Date();

  const [currentMonth, setCurrentMonth] = useState(new Date(defaultMonth.getFullYear(), defaultMonth.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filter, setFilter] = useState<FilterType>("todos");

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const matchDates = useMemo(() => {
    const dates = new Set<string>();
    allMatches.forEach((m) => {
      if (m.scheduled_at) dates.add(format(new Date(m.scheduled_at), "yyyy-MM-dd"));
    });
    return dates;
  }, [allMatches]);

  const filteredMatches = useMemo(() => {
    return allMatches.filter((m) => {
      if (!m.scheduled_at) return false;
      if (selectedDay && !isSameDay(new Date(m.scheduled_at), selectedDay)) return false;
      if (filter !== "todos" && phaseToFilter(m.phase) !== filter) return false;
      return true;
    }).sort((a, b) =>
      new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
    );
  }, [selectedDay, filter, allMatches]);

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="animate-slide-up">
      <div className="bg-green-900 px-4 pt-4 pb-3">
        <h1 className="text-white font-black text-xl mb-3">Calendário</h1>
        <div className="flex items-center justify-between">
          <button onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-800/60 text-green-200">
            <ChevronLeft size={18} />
          </button>
          <span className="text-white font-bold text-sm capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-800/60 text-green-200">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-green-900 px-3 pb-4">
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-green-500 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const hasMatches = matchDates.has(dateKey);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            return (
              <button key={dateKey} onClick={() => setSelectedDay(isSelected ? null : day)}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all mx-0.5",
                  isSelected && "bg-clay-500",
                  !isSelected && "hover:bg-green-800/40"
                )}>
                <span className={cn("text-xs font-semibold leading-none",
                  isSelected ? "text-white font-bold"
                    : isCurrentMonth ? "text-green-100"
                    : "text-green-700")}>
                  {format(day, "d")}
                </span>
                {hasMatches && isCurrentMonth && (
                  <span className={cn("w-1 h-1 rounded-full", isSelected ? "bg-white" : "bg-clay-400")} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map(({ key, label, color }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              filter === key ? "bg-green-900 text-white border-green-900" : "bg-white text-gray-500 border-gray-200"
            )}>
            <span className={cn("w-2 h-2 rounded-full", color)} />{label}
          </button>
        ))}
      </div>

      {/* Match list */}
      <div className="px-4 pb-6">
        {selectedDay && (
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        )}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {filteredMatches.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-300 text-3xl mb-2">🎾</p>
              <p className="text-gray-400 text-sm font-medium">
                {selectedDay ? "Nenhum jogo neste dia" : "Nenhum jogo encontrado"}
              </p>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const hasResult = m.status === "completed" || m.status === "wo";
              const setsScore = hasResult && m.sets.length
                ? `${m.sets.filter((s) => s.player1_games > s.player2_games).length}-${m.sets.filter((s) => s.player2_games > s.player1_games).length}`
                : null;

              return (
                <div key={m.id} className="flex items-center px-4 py-3 gap-3 border-b border-gray-50 last:border-0">
                  <div className="text-right min-w-[36px]">
                    <span className="text-xs font-bold text-gray-600">
                      {m.scheduled_at ? format(new Date(m.scheduled_at), "HH:mm") : "--:--"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[10px] text-gray-400 font-medium">
                        {PHASE_LABEL[m.phase] ?? m.phase}{m.group_letter ? ` ${m.group_letter}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <Avatar name={m.player1?.name ?? ""} size="xs" />
                        <span className={cn("text-xs font-semibold truncate", hasResult && m.winner_id === m.player1_id ? "text-gray-900 font-bold" : hasResult ? "text-gray-400" : "text-gray-700")}>
                          {m.player1?.name?.split(" ")[0] ?? "A definir"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center min-w-[32px]">
                        {setsScore ? <span className="text-xs font-black text-gray-700">{setsScore}</span>
                          : <span className="text-[10px] text-gray-300 font-bold">VS</span>}
                      </div>
                      <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                        <span className={cn("text-xs font-semibold truncate", hasResult && m.winner_id === m.player2_id ? "text-gray-900 font-bold" : hasResult ? "text-gray-400" : "text-gray-700")}>
                          {m.player2?.name?.split(" ")[0] ?? "A definir"}
                        </span>
                        <Avatar name={m.player2?.name ?? ""} size="xs" />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {m.status === "completed" && <Badge variant="victory" className="text-[9px]">Concluído</Badge>}
                    {m.status === "scheduled" && <Badge variant="pending" className="text-[9px]">Pendente</Badge>}
                    {m.status === "wo" && <Badge variant="wo" className="text-[9px]">WO</Badge>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
