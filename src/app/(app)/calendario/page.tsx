"use client";

import { useState, useMemo } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { MOCK_MATCHES } from "@/lib/mock-data";
import { cn } from "@/utils/cn";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
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
  if (phase === "quarterfinals" || phase === "consolation_quarterfinals")
    return "quartas";
  if (phase === "semifinals" || phase === "consolation_semifinals")
    return "semi";
  if (phase === "final" || phase === "consolation_final") return "final";
  return "todos";
}

function MatchRow({ match }: { match: Match }) {
  const hasResult = match.status === "completed" || match.status === "wo";
  const phaseLabel: Record<string, string> = {
    group: "Grupo",
    quarterfinals: "Quartas",
    semifinals: "Semifinais",
    final: "Final",
    consolation_quarterfinals: "Consol. Quartas",
    consolation_semifinals: "Consol. Semi",
    consolation_final: "Consol. Final",
  };

  const setsScore = match.sets.length
    ? `${match.sets.filter((s) => s.player1_games > s.player2_games).length}-${
        match.sets.filter((s) => s.player2_games > s.player1_games).length
      }`
    : null;

  return (
    <div className="flex items-center px-4 py-3 gap-3 border-b border-gray-50 last:border-0">
      <div className="text-right min-w-[36px]">
        <span className="text-xs font-bold text-gray-600">
          {match.scheduled_at
            ? format(new Date(match.scheduled_at), "HH:mm")
            : "--:--"}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 mb-0.5">
          <span className="text-[10px] text-gray-400 font-medium">
            {phaseLabel[match.phase]}
            {match.group_letter ? ` ${match.group_letter}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <Avatar name={match.player1?.name ?? ""} size="xs" />
            <span
              className={cn(
                "text-xs font-semibold truncate",
                match.winner_id === match.player1_id && hasResult
                  ? "text-gray-900 font-bold"
                  : hasResult && match.winner_id
                  ? "text-gray-400"
                  : "text-gray-700"
              )}
            >
              {match.player1?.name.split(" ")[0]}
            </span>
          </div>
          <div className="flex flex-col items-center min-w-[32px]">
            {hasResult && setsScore ? (
              <span className="text-xs font-black text-gray-700">
                {setsScore}
              </span>
            ) : (
              <span className="text-[10px] text-gray-300 font-bold">VS</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
            <span
              className={cn(
                "text-xs font-semibold truncate",
                match.winner_id === match.player2_id && hasResult
                  ? "text-gray-900 font-bold"
                  : hasResult && match.winner_id
                  ? "text-gray-400"
                  : "text-gray-700"
              )}
            >
              {match.player2?.name.split(" ")[0]}
            </span>
            <Avatar name={match.player2?.name ?? ""} size="xs" />
          </div>
        </div>
      </div>

      <div className="shrink-0">
        {match.status === "completed" && (
          <Badge variant="victory" className="text-[9px]">
            Concluído
          </Badge>
        )}
        {match.status === "scheduled" && (
          <Badge variant="pending" className="text-[9px]">
            Pendente
          </Badge>
        )}
        {match.status === "wo" && (
          <Badge variant="wo" className="text-[9px]">
            WO
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function CalendarioPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date("2026-05-01"));
  const [selectedDay, setSelectedDay] = useState<Date | null>(
    new Date("2026-05-20")
  );
  const [filter, setFilter] = useState<FilterType>("todos");

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { locale: ptBR });
    const end = endOfWeek(endOfMonth(currentMonth), { locale: ptBR });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const matchDates = useMemo(() => {
    const dates = new Set<string>();
    MOCK_MATCHES.forEach((m) => {
      if (m.scheduled_at) {
        dates.add(format(new Date(m.scheduled_at), "yyyy-MM-dd"));
      }
    });
    return dates;
  }, []);

  const filteredMatches = useMemo(() => {
    return MOCK_MATCHES.filter((m) => {
      if (!m.scheduled_at) return false;
      if (selectedDay && !isSameDay(new Date(m.scheduled_at), selectedDay))
        return false;
      if (filter !== "todos" && phaseToFilter(m.phase) !== filter) return false;
      return true;
    }).sort((a, b) => {
      if (!a.scheduled_at || !b.scheduled_at) return 0;
      return (
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      );
    });
  }, [selectedDay, filter]);

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="bg-green-900 px-4 pt-4 pb-3">
        <h1 className="text-white font-black text-xl mb-3">Calendário</h1>

        {/* Month navigator */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-800/60 text-green-200"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-white font-bold text-sm capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-green-800/60 text-green-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-green-900 px-3 pb-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {weekDays.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-bold text-green-500 py-1"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const hasMatches = matchDates.has(dateKey);
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isToday = isSameDay(day, new Date("2026-05-20"));

            return (
              <button
                key={dateKey}
                onClick={() =>
                  setSelectedDay(isSelected ? null : day)
                }
                className={cn(
                  "flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all mx-0.5",
                  isSelected && "bg-clay-500",
                  !isSelected && isToday && "bg-green-800",
                  !isSelected && !isToday && "hover:bg-green-800/40"
                )}
              >
                <span
                  className={cn(
                    "text-xs font-semibold leading-none",
                    isSelected
                      ? "text-white font-bold"
                      : isToday
                      ? "text-white"
                      : isCurrentMonth
                      ? "text-green-100"
                      : "text-green-700"
                  )}
                >
                  {format(day, "d")}
                </span>
                {hasMatches && isCurrentMonth && (
                  <span
                    className={cn(
                      "w-1 h-1 rounded-full",
                      isSelected ? "bg-white" : "bg-clay-400"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {FILTERS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
              filter === key
                ? "bg-green-900 text-white border-green-900"
                : "bg-white text-gray-500 border-gray-200"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", color)} />
            {label}
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
                {selectedDay
                  ? "Nenhum jogo neste dia"
                  : "Nenhum jogo encontrado"}
              </p>
            </div>
          ) : (
            filteredMatches.map((m) => <MatchRow key={m.id} match={m} />)
          )}
        </div>
      </div>
    </div>
  );
}
