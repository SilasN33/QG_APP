"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MatchResultPanel } from "@/components/panels/MatchResultPanel";
import { cn } from "@/utils/cn";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameDay, isSameMonth, addMonths, subMonths,
  startOfWeek, endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft, ChevronRight, Plus, X, Search,
  Clock, MapPin, Check, Loader2, ClipboardList,
} from "lucide-react";
import { scheduleMatchAction } from "@/lib/actions/scheduleMatch";
import type { Match, Player } from "@/types";

type FilterType = "todos" | "grupos" | "quartas" | "semi" | "final";

const FILTERS: { key: FilterType; label: string; dot: string }[] = [
  { key: "todos",   label: "Todos",  dot: "bg-white/30" },
  { key: "grupos",  label: "Grupos", dot: "bg-lime-500" },
  { key: "quartas", label: "Quartas",dot: "bg-blue-400" },
  { key: "semi",    label: "Semi",   dot: "bg-amber-400" },
  { key: "final",   label: "Final",  dot: "bg-red-400" },
];

function phaseToFilter(phase: string): FilterType {
  if (phase === "group") return "grupos";
  if (phase.includes("quarterfinals")) return "quartas";
  if (phase.includes("semifinals")) return "semi";
  if (phase.includes("final")) return "final";
  return "todos";
}

const PHASE_LABEL: Record<string, string> = {
  group:                    "Grupo",
  quarterfinals:            "Quartas",
  semifinals:               "Semifinais",
  final:                    "Final",
  consolation_quarterfinals:"Consol. Quartas",
  consolation_semifinals:   "Consol. Semi",
  consolation_final:        "Consol. Final",
};

interface Props {
  allMatches:    Match[];
  allPlayers:    Player[];
  currentPlayer: Player | null;
}

export function CalendarioClient({ allMatches, allPlayers, currentPlayer }: Props) {
  const router = useRouter();

  const firstMatchDate = allMatches.find((m) => m.scheduled_at)?.scheduled_at;
  const defaultMonth   = firstMatchDate ? new Date(firstMatchDate) : new Date();

  const [currentMonth, setCurrentMonth] = useState(
    new Date(defaultMonth.getFullYear(), defaultMonth.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filter, setFilter]           = useState<FilterType>("todos");

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [opponent, setOpponent]                   = useState<Player | null>(null);
  const [opponentSearch, setOpponentSearch]       = useState("");
  const [scheduleTime, setScheduleTime]           = useState("10:00");
  const [court, setCourt]                         = useState("");
  const [saving, setSaving]                       = useState(false);
  const [saveError, setSaveError]                 = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess]             = useState(false);

  // Result modal state
  const [resultMatch, setResultMatch] = useState<Match | null>(null);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end   = endOfWeek(endOfMonth(currentMonth),     { weekStartsOn: 1 });
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
    return allMatches
      .filter((m) => {
        if (!m.scheduled_at) return false;
        if (selectedDay && !isSameDay(new Date(m.scheduled_at), selectedDay)) return false;
        if (filter !== "todos" && phaseToFilter(m.phase) !== filter) return false;
        return true;
      })
      .sort((a, b) =>
        new Date(a.scheduled_at!).getTime() - new Date(b.scheduled_at!).getTime()
      );
  }, [selectedDay, filter, allMatches]);

  const opponents = useMemo(
    () => allPlayers.filter((p) => p.id !== currentPlayer?.id),
    [allPlayers, currentPlayer]
  );

  const filteredOpponents = useMemo(
    () =>
      opponentSearch.trim()
        ? opponents.filter((p) =>
            p.name.toLowerCase().includes(opponentSearch.toLowerCase())
          )
        : opponents,
    [opponents, opponentSearch]
  );

  function openScheduleModal() {
    setOpponent(null);
    setOpponentSearch("");
    setScheduleTime("10:00");
    setCourt("");
    setSaveError(null);
    setSaveSuccess(false);
    setShowScheduleModal(true);
  }

  function closeScheduleModal() {
    if (saving) return;
    setShowScheduleModal(false);
  }

  async function handleSchedule() {
    if (!selectedDay || !opponent) return;
    setSaving(true);
    setSaveError(null);

    const dateStr      = format(selectedDay, "yyyy-MM-dd");
    const scheduled_at = new Date(`${dateStr}T${scheduleTime}:00`).toISOString();

    const { error } = await scheduleMatchAction({
      opponent_id: opponent.id,
      scheduled_at,
      court: court.trim() || null,
    });

    if (error) {
      setSaveError(error);
      setSaving(false);
      return;
    }

    setSaveSuccess(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setSaveSuccess(false);
      router.refresh();
    }, 1200);
  }

  function isMyMatch(match: Match): boolean {
    if (!currentPlayer) return false;
    return match.player1_id === currentPlayer.id || match.player2_id === currentPlayer.id;
  }

  function canRegisterResult(match: Match): boolean {
    return isMyMatch(match) && (match.status === "scheduled" || match.status === "pending_result");
  }

  const weekDays = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <>
      <div className="animate-slide-up">
        {/* Calendar header */}
        <div className="bg-green-900 px-4 pt-5 pb-4">
          <h1 className="font-display font-bold text-white text-xl mb-4">Calendário</h1>
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-0/40 border border-white/[0.07] text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-display font-bold text-white text-sm capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </span>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-0/40 border border-white/[0.07] text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-green-900 px-3 pb-5">
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map((d) => (
              <div key={d} className="text-center text-[9px] font-bold text-white/25 py-1 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((day) => {
              const dateKey        = format(day, "yyyy-MM-dd");
              const hasMatches     = matchDates.has(dateKey);
              const isSelected     = selectedDay && isSameDay(day, selectedDay);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 rounded-xl transition-all mx-0.5",
                    isSelected
                      ? "bg-lime-500"
                      : "hover:bg-white/[0.06]"
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold leading-none",
                      isSelected
                        ? "text-surface-0 font-bold"
                        : isCurrentMonth
                        ? "text-white/80"
                        : "text-white/15"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {hasMatches && isCurrentMonth && (
                    <span
                      className={cn(
                        "w-1 h-1 rounded-full",
                        isSelected ? "bg-surface-0/60" : "bg-lime-500"
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
          {FILTERS.map(({ key, label, dot }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                filter === key
                  ? "bg-surface-3 text-white border-white/[0.12]"
                  : "bg-transparent text-white/30 border-white/[0.06] hover:border-white/15"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", dot)} />
              {label}
            </button>
          ))}
        </div>

        {/* Match list */}
        <div className="px-4 pb-6">
          {selectedDay && (
            <div className="flex items-center justify-between mb-2.5 px-1">
              <p className="text-[10px] font-display font-bold text-white/25 uppercase tracking-widest capitalize">
                {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              {currentPlayer && (
                <button
                  onClick={openScheduleModal}
                  className="flex items-center gap-1 text-xs font-bold text-lime-500/80 bg-lime-500/10 hover:bg-lime-500/15 border border-lime-500/20 transition-colors px-3 py-1.5 rounded-full"
                >
                  <Plus size={12} />
                  Marcar jogo
                </button>
              )}
            </div>
          )}

          <div className="bg-surface-2 rounded-2xl border border-white/[0.06] shadow-card overflow-hidden">
            {filteredMatches.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-4xl mb-3">🎾</p>
                <p className="text-white/25 text-sm font-medium">
                  {selectedDay ? "Nenhum jogo neste dia" : "Nenhum jogo encontrado"}
                </p>
              </div>
            ) : (
              filteredMatches.map((m) => {
                const hasResult    = m.status === "completed" || m.status === "wo";
                const canRegister  = canRegisterResult(m);
                const setsScore    =
                  hasResult && m.sets.length
                    ? `${m.sets.filter((s) => s.player1_games > s.player2_games).length}–${m.sets.filter((s) => s.player2_games > s.player1_games).length}`
                    : null;

                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-center px-4 py-3.5 gap-3 border-b border-white/[0.03] last:border-0",
                      canRegister && "cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.05] transition-colors"
                    )}
                    onClick={() => canRegister && setResultMatch(m)}
                  >
                    <div className="text-right min-w-[36px]">
                      <span className="text-xs font-semibold text-white/35">
                        {m.scheduled_at
                          ? format(new Date(m.scheduled_at), "HH:mm")
                          : "--:--"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/25 mb-1">
                        {PHASE_LABEL[m.phase] ?? m.phase}
                        {m.group_letter ? ` ${m.group_letter}` : ""}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Avatar name={m.player1?.name ?? ""} size="xs" />
                          <span
                            className={cn(
                              "text-xs font-semibold truncate",
                              hasResult && m.winner_id === m.player1_id
                                ? "text-white/90 font-bold"
                                : hasResult
                                ? "text-white/25"
                                : "text-white/70"
                            )}
                          >
                            {m.player1?.name?.split(" ")[0] ?? "A definir"}
                          </span>
                        </div>
                        <div className="flex flex-col items-center min-w-[32px]">
                          {setsScore ? (
                            <span className="text-xs font-display font-bold text-white/60">{setsScore}</span>
                          ) : (
                            <span className="text-[10px] text-white/20 font-bold">VS</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                          <span
                            className={cn(
                              "text-xs font-semibold truncate",
                              hasResult && m.winner_id === m.player2_id
                                ? "text-white/90 font-bold"
                                : hasResult
                                ? "text-white/25"
                                : "text-white/70"
                            )}
                          >
                            {m.player2?.name?.split(" ")[0] ?? "A definir"}
                          </span>
                          <Avatar name={m.player2?.name ?? ""} size="xs" />
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {canRegister && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-lime-500/70 bg-lime-500/10 border border-lime-500/20 px-2 py-1 rounded-lg">
                          <ClipboardList size={10} />
                          Registrar
                        </span>
                      )}
                      {m.status === "completed" && <Badge variant="victory" className="text-[9px]">Concluído</Badge>}
                      {m.status === "scheduled" && !canRegister && <Badge variant="pending" className="text-[9px]">Pendente</Badge>}
                      {m.status === "wo" && <Badge variant="wo" className="text-[9px]">WO</Badge>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Schedule modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeScheduleModal} />

          <div className="relative bg-surface-2 border-t border-white/[0.08] rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <div>
                <h2 className="font-display font-bold text-base text-white">Marcar Jogo</h2>
                {selectedDay && (
                  <p className="text-[11px] text-white/30 capitalize mt-0.5">
                    {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </p>
                )}
              </div>
              <button
                onClick={closeScheduleModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-3 text-white/40 hover:text-white hover:bg-surface-4 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
              {saveSuccess ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <div className="w-16 h-16 rounded-full bg-lime-500/15 border border-lime-500/30 flex items-center justify-center">
                    <Check size={28} className="text-lime-500" />
                  </div>
                  <p className="font-display font-bold text-base text-white">Jogo agendado!</p>
                </div>
              ) : (
                <>
                  {/* Opponent */}
                  <div>
                    <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30 mb-2">
                      Adversário
                    </p>
                    <div className="relative mb-2">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        value={opponentSearch}
                        onChange={(e) => setOpponentSearch(e.target.value)}
                        placeholder="Buscar jogador..."
                        className="w-full pl-8 pr-3 py-2.5 text-sm bg-surface-3 border border-white/[0.07] text-white placeholder-white/20 rounded-xl focus:outline-none focus:border-lime-500/40 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {filteredOpponents.length === 0 ? (
                        <p className="text-xs text-white/25 text-center py-4">Nenhum jogador encontrado</p>
                      ) : (
                        filteredOpponents.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => setOpponent(p)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition-all text-left",
                              opponent?.id === p.id
                                ? "border-lime-500/40 bg-lime-500/[0.07]"
                                : "border-white/[0.06] bg-surface-3 hover:border-white/12"
                            )}
                          >
                            <Avatar name={p.name} src={p.avatar_url} size="sm" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white/80 truncate">{p.name}</p>
                              {p.group_letter && (
                                <p className="text-[10px] text-white/30">Grupo {p.group_letter}</p>
                              )}
                            </div>
                            {opponent?.id === p.id && (
                              <Check size={15} className="text-lime-500 shrink-0" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30 mb-2">
                      Horário
                    </p>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 text-sm bg-surface-3 border border-white/[0.07] text-white rounded-xl focus:outline-none focus:border-lime-500/40 transition-colors [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Court */}
                  <div>
                    <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30 mb-2">
                      Quadra{" "}
                      <span className="normal-case font-normal text-white/20">(opcional)</span>
                    </p>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        value={court}
                        onChange={(e) => setCourt(e.target.value)}
                        placeholder="Ex: Quadra 1"
                        className="w-full pl-8 pr-3 py-2.5 text-sm bg-surface-3 border border-white/[0.07] text-white placeholder-white/20 rounded-xl focus:outline-none focus:border-lime-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  {saveError && (
                    <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-center">
                      {saveError}
                    </p>
                  )}
                </>
              )}
            </div>

            {!saveSuccess && (
              <div className="px-5 pb-6 pt-3 border-t border-white/[0.06]">
                <Button
                  fullWidth
                  size="lg"
                  onClick={handleSchedule}
                  disabled={saving || !opponent}
                  className="font-display font-bold tracking-wide"
                >
                  {saving ? (
                    <><Loader2 size={16} className="animate-spin" /> Agendando...</>
                  ) : (
                    "Confirmar Agendamento"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Result registration modal */}
      {resultMatch && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setResultMatch(null)}
          />

          <div className="relative bg-surface-2 border-t border-white/[0.08] rounded-t-3xl max-h-[90vh] flex flex-col animate-slide-up">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/[0.12]" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
              <div>
                <h2 className="font-display font-bold text-base text-white">Registrar Resultado</h2>
                {resultMatch.scheduled_at && (
                  <p className="text-[11px] text-white/30 capitalize mt-0.5">
                    {format(new Date(resultMatch.scheduled_at), "EEEE, d 'de' MMMM · HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>
              <button
                onClick={() => setResultMatch(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-3 text-white/40 hover:text-white hover:bg-surface-4 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <MatchResultPanel
                match={resultMatch}
                currentPlayerId={currentPlayer?.id ?? ""}
                onClose={() => setResultMatch(null)}
                onSuccess={() => {
                  setResultMatch(null);
                  router.refresh();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
