"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import { Crown, Medal, TrendingUp } from "lucide-react";
import type { Standing, GroupLetter } from "@/types";

const GROUPS: GroupLetter[] = ["A", "B", "C", "D"];

interface Props {
  allStandings:       Standing[];
  currentPlayerId:    string | null;
  currentPlayerGroup: GroupLetter | null;
}

function RankBadge({ position }: { position: number }) {
  if (position === 1) return <Crown size={15} className="text-amber-400" />;
  if (position === 2) return <Medal size={15} className="text-white/40" />;
  if (position === 3) return <Medal size={15} className="text-amber-700/80" />;
  return (
    <span className="text-[11px] font-display font-bold text-white/25 w-4 text-center">
      {position}
    </span>
  );
}

export function RankingClient({ allStandings, currentPlayerId, currentPlayerGroup }: Props) {
  const defaultGroup = currentPlayerGroup ?? "A";
  const [activeGroup, setActiveGroup] = useState<GroupLetter>(defaultGroup);

  const groupStandings = allStandings.filter((s) => s.group_letter === activeGroup);
  const top3           = groupStandings.slice(0, 3);
  const myStanding     = groupStandings.find((s) => s.player.id === currentPlayerId);
  const myPos          = groupStandings.findIndex((s) => s.player.id === currentPlayerId) + 1;

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="bg-green-900 px-4 pt-5 pb-8">
        <h1 className="font-display font-bold text-white text-xl mb-5">Ranking por Grupo</h1>

        {/* Group tabs */}
        <div className="flex gap-2 mb-7">
          {GROUPS.map((g) => {
            const hasPlayers = allStandings.some((s) => s.group_letter === g);
            return (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                disabled={!hasPlayers}
                className={cn(
                  "flex-1 py-2 rounded-xl font-display font-bold text-sm transition-all border",
                  activeGroup === g
                    ? "bg-lime-500 text-surface-0 border-lime-500 shadow-glow"
                    : hasPlayers
                    ? "bg-surface-0/30 text-white/60 border-white/[0.08] hover:border-white/20"
                    : "bg-surface-0/10 text-white/20 border-white/[0.04] cursor-not-allowed"
                )}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Podium */}
        {top3.length > 0 ? (
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            {top3[1] ? (
              <div className="flex flex-col items-center gap-2 pb-1">
                <Avatar name={top3[1].player.name} src={top3[1].player.avatar_url} size="md" />
                <div className="text-center">
                  <p className="text-white/80 text-xs font-semibold leading-tight">
                    {top3[1].player.name.split(" ")[0]}
                  </p>
                  <p className="text-white/35 text-[10px]">{top3[1].points} pts</p>
                </div>
                <div className="w-14 bg-surface-3/80 border border-white/[0.07] rounded-t-lg h-12 flex items-center justify-center">
                  <Medal size={16} className="text-white/40" />
                </div>
              </div>
            ) : (
              <div className="w-14" />
            )}

            {/* 1st */}
            <div className="flex flex-col items-center gap-2 -mb-1">
              <Crown size={16} className="text-amber-400" />
              <Avatar
                name={top3[0].player.name}
                src={top3[0].player.avatar_url}
                size="lg"
                className="ring-2 ring-lime-500/60 ring-offset-2 ring-offset-green-900"
              />
              <div className="text-center">
                <p className="text-white font-display font-bold text-sm leading-tight">
                  {top3[0].player.name.split(" ")[0]}
                </p>
                <p className="text-lime-500 text-[11px] font-bold">{top3[0].points} pts</p>
              </div>
              <div className="w-14 bg-lime-500/15 border border-lime-500/30 rounded-t-lg h-16 flex items-center justify-center">
                <Crown size={18} className="text-lime-500" />
              </div>
            </div>

            {/* 3rd */}
            {top3[2] ? (
              <div className="flex flex-col items-center gap-2 pb-1">
                <Avatar name={top3[2].player.name} src={top3[2].player.avatar_url} size="md" />
                <div className="text-center">
                  <p className="text-white/80 text-xs font-semibold leading-tight">
                    {top3[2].player.name.split(" ")[0]}
                  </p>
                  <p className="text-white/35 text-[10px]">{top3[2].points} pts</p>
                </div>
                <div className="w-14 bg-surface-3/80 border border-white/[0.07] rounded-t-lg h-8 flex items-center justify-center">
                  <Medal size={14} className="text-amber-700/70" />
                </div>
              </div>
            ) : (
              <div className="w-14" />
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-white/25 text-sm">Nenhum jogador no grupo {activeGroup}</p>
          </div>
        )}
      </div>

      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* My position */}
        {myStanding && myPos > 0 && (
          <div className="bg-green-900 border border-lime-500/20 rounded-2xl p-4 flex items-center gap-3">
            <TrendingUp size={18} className="text-lime-500 shrink-0" />
            <div className="flex-1">
              <p className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">
                Sua posição · Grupo {activeGroup}
              </p>
              <p className="font-display font-bold text-white text-lg leading-tight">
                {myPos}º de {groupStandings.length}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-bold text-lime-500 text-2xl leading-none">
                {myStanding.points}
              </p>
              <p className="text-white/25 text-[10px] font-semibold uppercase tracking-wide mt-0.5">
                pontos
              </p>
            </div>
          </div>
        )}

        {/* Standings table */}
        <div className="bg-surface-2 rounded-2xl border border-white/[0.06] overflow-hidden shadow-card">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/35">
              Grupo {activeGroup}
            </span>
            <span className="text-[10px] text-white/20">{groupStandings.length} jogadores</span>
          </div>

          {/* Column headers */}
          <div className="flex items-center px-4 py-2 border-b border-white/[0.04] gap-3">
            <div className="w-5" />
            <div className="w-8" />
            <div className="flex-1 text-[9px] font-bold uppercase tracking-wider text-white/20">
              Jogador
            </div>
            <div className="flex gap-3 shrink-0 text-[9px] font-bold uppercase tracking-wider text-white/20">
              <span className="w-6 text-center">Pts</span>
              <span className="w-6 text-center">V</span>
              <span className="w-6 text-center">D</span>
            </div>
          </div>

          {groupStandings.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-4xl mb-3">🎾</p>
              <p className="text-white/25 text-sm">Nenhuma partida registrada neste grupo</p>
            </div>
          ) : (
            groupStandings.map((s, i) => {
              const isCurrent = s.player.id === currentPlayerId;
              const winRate   = s.matches_played > 0
                ? Math.round((s.wins / s.matches_played) * 100)
                : 0;
              return (
                <div
                  key={s.player.id}
                  className={cn(
                    "flex items-center px-4 py-3 gap-3 border-b border-white/[0.03] last:border-0 transition-colors",
                    isCurrent ? "bg-lime-500/[0.06]" : "hover:bg-white/[0.02]"
                  )}
                >
                  <div className="w-5 flex justify-center shrink-0">
                    <RankBadge position={i + 1} />
                  </div>
                  <Avatar
                    name={s.player.name}
                    src={s.player.avatar_url}
                    size="sm"
                    className={cn(isCurrent && "ring-2 ring-lime-500/50 ring-offset-1 ring-offset-surface-2")}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-semibold truncate",
                      isCurrent ? "text-lime-400" : "text-white/80"
                    )}>
                      {s.player.name}
                      {isCurrent && (
                        <span className="ml-1.5 text-[9px] text-lime-500/70 font-bold uppercase tracking-wide">
                          você
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-white/25">
                      {s.matches_played} partida{s.matches_played !== 1 ? "s" : ""} · {winRate}% aprov.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center w-6">
                      <p className="text-sm font-display font-bold text-white/80">{s.points}</p>
                    </div>
                    <div className="text-center w-6">
                      <p className="text-sm font-bold text-lime-500">{s.wins}</p>
                    </div>
                    <div className="text-center w-6">
                      <p className="text-sm font-bold text-red-400/70">{s.losses}</p>
                    </div>
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
