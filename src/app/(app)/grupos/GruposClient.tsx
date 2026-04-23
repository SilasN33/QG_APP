"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
  const [activeTab, setActiveTab] = useState<"tabela" | "jogos">("tabela");

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
      <div className="bg-green-900 px-4 pt-4 pb-5">
        <h1 className="text-white font-black text-xl mb-4">Grupos</h1>
        <div className="flex gap-2">
          {GROUPS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={cn(
                "flex-1 py-2 rounded-xl text-sm font-bold transition-all",
                activeGroup === g
                  ? "bg-clay-500 text-white shadow"
                  : "bg-green-800/60 text-green-300 hover:bg-green-800"
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-3 space-y-3">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(["tabela", "jogos"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-white text-green-900 shadow-sm" : "text-gray-400"
              )}
            >
              {tab === "tabela" ? "Tabela" : "Jogos"}
            </button>
          ))}
        </div>

        {activeTab === "tabela" && (
          <Card className="border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-black text-gray-900 text-base">Grupo {activeGroup}</h2>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                {groupStandings[0]?.matches_played ?? 0} rodada(s)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <th className="text-left pb-2 pl-1 w-6">Pos</th>
                    <th className="text-left pb-2">Jogador</th>
                    <th className="text-center pb-2 w-7">P</th>
                    <th className="text-center pb-2 w-7">V</th>
                    <th className="text-center pb-2 w-7">D</th>
                    <th className="text-center pb-2 w-10">Sets</th>
                    <th className="text-center pb-2 w-12">Games</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {groupStandings.map((s, i) => {
                    const isClassified = i < 2;
                    const isDisputed = i === 2;
                    return (
                      <tr key={s.player.id} className={cn(isClassified && "bg-green-50/60")}>
                        <td className="py-2.5 pl-1">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black",
                            isClassified ? "bg-green-900 text-white"
                              : isDisputed ? "bg-clay-100 text-clay-600"
                              : "bg-gray-100 text-gray-400"
                          )}>
                            {s.position}
                          </span>
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={s.player.name} size="xs" />
                            <span className={cn("font-semibold text-xs truncate max-w-[90px]", isClassified ? "text-gray-900" : "text-gray-600")}>
                              {s.player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-black text-gray-800 text-xs">{s.points}</td>
                        <td className="py-2.5 text-center text-gray-600 text-xs">{s.wins}</td>
                        <td className="py-2.5 text-center text-gray-600 text-xs">{s.losses}</td>
                        <td className="py-2.5 text-center text-gray-500 text-xs">{s.sets_won}-{s.sets_lost}</td>
                        <td className="py-2.5 text-center text-gray-500 text-xs">{s.games_won}-{s.games_lost}</td>
                      </tr>
                    );
                  })}
                  {groupStandings.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">Nenhum jogador no grupo</td></tr>
                  )}
                </tbody>
              </table>
              <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-900 inline-block" />
                  <span className="text-[10px] text-gray-400">Classificado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-clay-400 inline-block" />
                  <span className="text-[10px] text-gray-400">Em disputa</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "jogos" && (
          <Card className="border border-gray-100" padding="none">
            <div className="px-4 pt-4 pb-2">
              <h2 className="font-black text-gray-900 text-base">Jogos — Grupo {activeGroup}</h2>
            </div>
            {filteredMatches.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">Nenhum jogo cadastrado</p>
            ) : (
              filteredMatches.map((m) => {
                const hasResult = m.status === "completed" || m.status === "wo";
                const setsScore = hasResult && m.sets.length
                  ? `${m.sets.filter((s) => s.player1_games > s.player2_games).length}-${m.sets.filter((s) => s.player2_games > s.player1_games).length}`
                  : null;

                return (
                  <div key={m.id} className="flex items-center py-3 px-4 gap-2 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-xs text-gray-400">
                          {m.scheduled_at ? format(new Date(m.scheduled_at), "d MMM · HH:mm", { locale: ptBR }) : "A definir"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <Avatar name={m.player1?.name ?? ""} size="xs" />
                          <span className={cn("text-xs font-semibold truncate", hasResult && m.winner_id === m.player1_id ? "text-gray-900 font-bold" : hasResult ? "text-gray-400" : "text-gray-700")}>
                            {m.player1?.name?.split(" ")[0]}
                          </span>
                        </div>
                        <div className="text-center min-w-[40px]">
                          {m.status === "wo" ? <Badge variant="wo">WO</Badge>
                            : setsScore ? <span className="text-xs font-black text-gray-700">{setsScore}</span>
                            : <span className="text-gray-300 font-bold text-xs">VS</span>}
                        </div>
                        <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                          <span className={cn("text-xs font-semibold truncate", hasResult && m.winner_id === m.player2_id ? "text-gray-900 font-bold" : hasResult ? "text-gray-400" : "text-gray-700")}>
                            {m.player2?.name?.split(" ")[0]}
                          </span>
                          <Avatar name={m.player2?.name ?? ""} size="xs" />
                        </div>
                      </div>
                    </div>
                    {hasResult && (
                      <Badge variant="group" className="shrink-0 text-[9px]">
                        {m.status === "wo" ? "WO" : "Concluído"}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
