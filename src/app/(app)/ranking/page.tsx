"use client";

import { Avatar } from "@/components/ui/Avatar";
import { MOCK_STANDINGS, CURRENT_PLAYER } from "@/lib/mock-data";
import { cn } from "@/utils/cn";
import { Crown, Medal, TrendingUp } from "lucide-react";
import type { Standing } from "@/types";

const globalRanking = [...MOCK_STANDINGS].sort((a, b) => {
  if (b.points !== a.points) return b.points - a.points;
  if (b.wins !== a.wins) return b.wins - a.wins;
  const aSetDiff = a.sets_won - a.sets_lost;
  const bSetDiff = b.sets_won - b.sets_lost;
  if (bSetDiff !== aSetDiff) return bSetDiff - aSetDiff;
  return b.games_won - b.games_lost - (a.games_won - a.games_lost);
});

function RankBadge({ position }: { position: number }) {
  if (position === 1)
    return <Crown size={16} className="text-amber-400" />;
  if (position === 2)
    return <Medal size={16} className="text-gray-400" />;
  if (position === 3)
    return <Medal size={16} className="text-amber-700" />;
  return (
    <span className="text-xs font-black text-gray-400 w-4 text-center">
      {position}
    </span>
  );
}

function RankRow({
  standing,
  globalPos,
  isCurrentPlayer,
}: {
  standing: Standing;
  globalPos: number;
  isCurrentPlayer: boolean;
}) {
  const winRate =
    standing.matches_played > 0
      ? Math.round((standing.wins / standing.matches_played) * 100)
      : 0;

  return (
    <div
      className={cn(
        "flex items-center px-4 py-3 gap-3 border-b border-gray-50 last:border-0 transition-colors",
        isCurrentPlayer && "bg-green-50"
      )}
    >
      <div className="w-5 flex justify-center shrink-0">
        <RankBadge position={globalPos} />
      </div>

      <Avatar
        name={standing.player.name}
        size="sm"
        className={cn(
          isCurrentPlayer && "ring-2 ring-clay-500 ring-offset-1"
        )}
      />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-semibold truncate",
            isCurrentPlayer ? "text-green-900 font-bold" : "text-gray-800"
          )}
        >
          {standing.player.name}
          {isCurrentPlayer && (
            <span className="ml-1 text-[10px] text-clay-500 font-bold">
              (você)
            </span>
          )}
        </p>
        <p className="text-[10px] text-gray-400">
          Grupo {standing.group_letter} · {winRate}% aproveitamento
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-center">
          <p className="text-sm font-black text-gray-800">
            {standing.points}
          </p>
          <p className="text-[9px] text-gray-400 uppercase font-semibold">
            pts
          </p>
        </div>
        <div className="text-center min-w-[24px]">
          <p className="text-sm font-bold text-green-700">{standing.wins}</p>
          <p className="text-[9px] text-gray-400 uppercase font-semibold">V</p>
        </div>
        <div className="text-center min-w-[24px]">
          <p className="text-sm font-bold text-clay-500">{standing.losses}</p>
          <p className="text-[9px] text-gray-400 uppercase font-semibold">D</p>
        </div>
      </div>
    </div>
  );
}

export default function RankingPage() {
  const myPos = globalRanking.findIndex(
    (s) => s.player.id === CURRENT_PLAYER.id
  ) + 1;
  const myStanding = globalRanking.find(
    (s) => s.player.id === CURRENT_PLAYER.id
  );

  const top3 = globalRanking.slice(0, 3);

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="bg-green-900 px-4 pt-4 pb-6">
        <h1 className="text-white font-black text-xl mb-5">Ranking Geral</h1>

        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-3">
          {/* 2nd */}
          {top3[1] && (
            <div className="flex flex-col items-center gap-2 pb-1">
              <Avatar name={top3[1].player.name} size="md" />
              <div className="text-center">
                <p className="text-white text-xs font-bold leading-tight">
                  {top3[1].player.name.split(" ")[0]}
                </p>
                <p className="text-green-400 text-[10px]">{top3[1].points} pts</p>
              </div>
              <div className="w-16 bg-green-700 rounded-t-lg h-12 flex items-center justify-center">
                <Medal size={18} className="text-gray-300" />
              </div>
            </div>
          )}

          {/* 1st */}
          {top3[0] && (
            <div className="flex flex-col items-center gap-2 -mb-1">
              <Crown size={18} className="text-amber-400" />
              <Avatar name={top3[0].player.name} size="lg" className="ring-2 ring-amber-400 ring-offset-2 ring-offset-green-900" />
              <div className="text-center">
                <p className="text-white text-sm font-black leading-tight">
                  {top3[0].player.name.split(" ")[0]}
                </p>
                <p className="text-clay-400 text-[11px] font-bold">
                  {top3[0].points} pts
                </p>
              </div>
              <div className="w-16 bg-green-600 rounded-t-lg h-16 flex items-center justify-center">
                <Crown size={20} className="text-amber-400" />
              </div>
            </div>
          )}

          {/* 3rd */}
          {top3[2] && (
            <div className="flex flex-col items-center gap-2 pb-1">
              <Avatar name={top3[2].player.name} size="md" />
              <div className="text-center">
                <p className="text-white text-xs font-bold leading-tight">
                  {top3[2].player.name.split(" ")[0]}
                </p>
                <p className="text-green-400 text-[10px]">{top3[2].points} pts</p>
              </div>
              <div className="w-16 bg-green-800 rounded-t-lg h-8 flex items-center justify-center">
                <Medal size={16} className="text-amber-700" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-6 space-y-3">
        {/* My position card */}
        {myStanding && (
          <div className="bg-green-900 rounded-2xl p-4 flex items-center gap-3">
            <TrendingUp size={18} className="text-clay-400 shrink-0" />
            <div className="flex-1">
              <p className="text-green-200 text-xs font-medium">
                Sua posição no ranking
              </p>
              <p className="text-white font-black text-lg leading-tight">
                {myPos}º de {globalRanking.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-clay-400 text-xl font-black">
                {myStanding.points}
              </p>
              <p className="text-green-500 text-[10px] font-semibold uppercase">
                pontos
              </p>
            </div>
          </div>
        )}

        {/* Full ranking list */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Classificação Geral
            </span>
            <span className="text-[10px] text-gray-300">
              {globalRanking.length} jogadores
            </span>
          </div>

          {/* Column header */}
          <div className="flex items-center px-4 py-2 border-b border-gray-50 gap-3">
            <div className="w-5" />
            <div className="w-8" />
            <div className="flex-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Jogador
            </div>
            <div className="flex gap-3 shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <span className="w-6 text-center">Pts</span>
              <span className="w-6 text-center">V</span>
              <span className="w-6 text-center">D</span>
            </div>
          </div>

          {globalRanking.map((s, i) => (
            <RankRow
              key={s.player.id}
              standing={s}
              globalPos={i + 1}
              isCurrentPlayer={s.player.id === CURRENT_PLAYER.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
