"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { GroupLetter, Standing, Match } from "@/types";

const GROUPS: GroupLetter[] = ["A", "B", "C", "D"];

interface Props {
  allStandings: Standing[];
  groupMatches: Match[];
}

export function GruposClient({ allStandings, groupMatches }: Props) {
  const [activeGroup, setActiveGroup] = useState<GroupLetter>("A");
  const [activeTab,   setActiveTab]   = useState<"tabela" | "jogos">("tabela");

  const groupStandings = allStandings
    .filter((s) => s.group_letter === activeGroup)
    .sort((a, b) => a.position - b.position);

  const filteredMatches = groupMatches
    .filter((m) => m.group_letter === activeGroup)
    .sort((a, b) => {
      if (!a.scheduled_at) return 1;
      if (!b.scheduled_at) return -1;
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="bg-green-900 px-4 pt-5 pb-5">
        <h1 className="font-display font-bold text-white text-xl mb-4">Grupos</h1>
        <div className="flex gap-2">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-display font-bold transition-all",
                activeGroup === g
                  ? "bg-lime-500 text-surface-0 shadow-glow"
                  : "bg-surface-0/40 text-white/40 hover:bg-surface-0/60 border border-white/[0.06]"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3 pb-6">
        {/* Tabs */}
        <div className="flex bg-surface-2 border border-white/[0.06] rounded-xl p-1 gap-1">
          {(["tabela", "jogos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === tab
                  ? "bg-surface-4 text-white shadow-sm"
                  : "text-white/30 hover:text-white/50"
              )}
            >
              {tab === "tabela" ? "Tabela" : "Jogos"}
            </button>
          ))}
        </div>

        {/* Standings table */}
        {activeTab === "tabela" && (
          <div className="bg-surface-2 rounded-2xl border border-white/[0.06] shadow-card overflow-hidden">
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.04]">
              <h2 className="font-display font-bold text-white text-base">
                Grupo {activeGroup}
              </h2>
              <span className="text-[10px] text-white/25 font-semibold uppercase tracking-wider">
                {groupStandings[0]?.matches_played ?? 0} rodada(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[9px] font-bold uppercase tracking-wider text-white/25">
                    <th className="text-left py-2 px-4 w-8">Pos</th>
                    <th className="text-left py-2">Jogador</th>
                    <th className="text-center py-2 w-7">P</th>
                    <th className="text-center py-2 w-7">V</th>
                    <th className="text-center py-2 w-7">D</th>
                    <th className="text-center py-2 w-10">Sets</th>
                    <th className="text-center py-2 pr-4 w-12">Games</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {groupStandings.map((s, i) => {
                    const isClassified = i < 2;
                    const isDisputed   = i === 2;
                    return (
                      <tr
                        key={s.player.id}
                        className={cn(isClassified && "bg-lime-500/[0.04]")}
                      >
                        <td className="py-3 px-4">
                          <span
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-display font-bold",
                              isClassified
                                ? "bg-lime-500/20 text-lime-400 border border-lime-500/30"
                                : isDisputed
                                ? "bg-amber-500/15 text-amber-400"
                                : "bg-surface-3 text-white/30"
                            )}
                          >
                            {s.position}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={s.player.name} src={s.player.avatar_url} size="xs" />
                            <span
                              className={cn(
                                "font-semibold text-xs truncate max-w-[90px]",
                                isClassified ? "text-white/80" : "text-white/45"
                              )}
                            >
                              {s.player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-center font-display font-bold text-white/80 text-xs">{s.points}</td>
                        <td className="py-3 text-center text-lime-500/80 text-xs font-semibold">{s.wins}</td>
                        <td className="py-3 text-center text-red-400/60 text-xs">{s.losses}</td>
                        <td className="py-3 text-center text-white/35 text-xs">{s.sets_won}-{s.sets_lost}</td>
                        <td className="py-3 text-center text-white/35 text-xs pr-4">{s.games_won}-{s.games_lost}</td>
                      </tr>
                    );
                  })}
                  {groupStandings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-white/25 text-sm">
                        Nenhum jogador no grupo
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex items-center gap-5 px-4 py-3 border-t border-white/[0.04]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-500/60 inline-block" />
                  <span className="text-[10px] text-white/30">Classificado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60 inline-block" />
                  <span className="text-[10px] text-white/30">Em disputa</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Matches list */}
        {activeTab === "jogos" && (
          <div className="bg-surface-2 rounded-2xl border border-white/[0.06] shadow-card overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-white/[0.04]">
              <h2 className="font-display font-bold text-white text-base">
                Jogos — Grupo {activeGroup}
              </h2>
            </div>
            {filteredMatches.length === 0 ? (
              <p className="text-center text-white/25 text-sm py-10">
                Nenhum jogo cadastrado
              </p>
            ) : (
              filteredMatches.map((m) => {
                const hasResult = m.status === "completed" || m.status === "wo";
                const setsScore = hasResult && m.sets.length
                  ? `${m.sets.filter((s) => s.player1_games > s.player2_games).length}–${m.sets.filter((s) => s.player2_games > s.player1_games).length}`
                  : null;

                return (
                  <div
                    key={m.id}
                    className="flex items-center py-3.5 px-4 gap-2 border-b border-white/[0.03] last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-white/25 block mb-1.5">
                        {m.scheduled_at
                          ? format(new Date(m.scheduled_at), "d MMM · HH:mm", { locale: ptBR })
                          : "A definir"}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <Avatar name={m.player1?.name ?? ""} size="xs" />
                          <span
                            className={cn(
                              "text-xs font-semibold truncate",
                              hasResult && m.winner_id === m.player1_id
                                ? "text-white/90 font-bold"
                                : hasResult
                                ? "text-white/30"
                                : "text-white/70"
                            )}
                          >
                            {m.player1?.name?.split(" ")[0]}
                          </span>
                        </div>
                        <div className="text-center min-w-[40px]">
                          {m.status === "wo" ? (
                            <Badge variant="wo">WO</Badge>
                          ) : setsScore ? (
                            <span className="text-xs font-display font-bold text-white/70">{setsScore}</span>
                          ) : (
                            <span className="text-white/20 font-bold text-xs">VS</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                          <span
                            className={cn(
                              "text-xs font-semibold truncate",
                              hasResult && m.winner_id === m.player2_id
                                ? "text-white/90 font-bold"
                                : hasResult
                                ? "text-white/30"
                                : "text-white/70"
                            )}
                          >
                            {m.player2?.name?.split(" ")[0]}
                          </span>
                          <Avatar name={m.player2?.name ?? ""} size="xs" />
                        </div>
                      </div>
                    </div>
                    {hasResult && (
                      <Badge variant="victory" className="shrink-0 text-[9px]">
                        {m.status === "wo" ? "WO" : "Concluído"}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
