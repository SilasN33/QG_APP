"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  Calendar, ClipboardEdit, BarChart2,
  CheckCircle2, Clock, XCircle, Minus, ChevronRight, Crown,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Player, Match, Standing } from "@/types";

function getMatchResult(
  match: Match,
  playerId: string
): "victory" | "defeat" | "wo" | "pending" {
  if (match.status === "scheduled" || match.status === "pending_result") return "pending";
  if (match.status === "wo") return match.winner_id === playerId ? "victory" : "defeat";
  if (!match.winner_id) return "pending";
  return match.winner_id === playerId ? "victory" : "defeat";
}

function getSetScore(match: Match, playerId: string) {
  const isP1 = match.player1_id === playerId;
  const won  = match.sets.filter((s) =>
    isP1 ? s.player1_games > s.player2_games : s.player2_games > s.player1_games
  ).length;
  const lost = match.sets.filter((s) =>
    isP1 ? s.player2_games > s.player1_games : s.player1_games > s.player2_games
  ).length;
  return `${won}–${lost}`;
}

interface Props {
  player:    Player;
  myMatches: Match[];
  standing:  Standing | null;
}

export function DashboardClient({ player, myMatches, standing }: Props) {
  const nextMatch     = myMatches.find((m) => m.status === "scheduled");
  const recentMatches = myMatches
    .filter((m) => m.status === "completed" || m.status === "wo")
    .slice(0, 3);

  const wins    = myMatches.filter((m) => m.winner_id === player.id).length;
  const losses  = myMatches.filter(
    (m) => m.winner_id && m.winner_id !== player.id && m.status === "completed"
  ).length;
  const pending = myMatches.filter((m) => m.status === "scheduled").length;
  const wo      = myMatches.filter(
    (m) => m.status === "wo" && m.winner_id !== player.id
  ).length;

  return (
    <div className="animate-slide-up">
      {/* Hero */}
      <div className="bg-green-900 px-5 pt-5 pb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              name={player.name}
              src={player.avatar_url}
              size="xl"
              className="ring-2 ring-lime-500/40 ring-offset-2 ring-offset-green-900"
            />
            {standing && (
              <span className="absolute -bottom-1 -right-1 bg-lime-500 text-surface-0 text-[10px] font-display font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-glow">
                {standing.position}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/40 text-[10px] font-display font-bold uppercase tracking-widest mb-0.5">
              Bem-vindo
            </p>
            <h2 className="font-display font-bold text-white text-xl leading-tight truncate">
              {player.name}
            </h2>
            {standing && (
              <span className="inline-flex items-center gap-1 text-lime-500 text-xs font-semibold mt-1">
                <Crown size={11} />
                {standing.position}º no ranking
              </span>
            )}
          </div>
          {player.group_letter && (
            <div className="shrink-0 flex flex-col items-center bg-surface-0/50 border border-white/[0.08] rounded-xl px-3 py-2">
              <span className="font-display font-bold text-lime-500 text-xl leading-none">
                {player.group_letter}
              </span>
              <span className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">
                Grupo
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3 pb-4 stagger animate-slide-up">
        {/* Next match */}
        {nextMatch && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/35">
                Próximo Jogo
              </span>
              <span className="text-lime-500 text-xs font-semibold">
                {nextMatch.scheduled_at
                  ? format(new Date(nextMatch.scheduled_at), "d MMM · HH:mm", { locale: ptBR })
                  : "A definir"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <Avatar name={nextMatch.player1?.name ?? "?"} size="md" />
                <span className="text-xs font-semibold text-white/80 text-center leading-tight">
                  {nextMatch.player1?.name?.split(" ")[0] ?? "A definir"}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-white/20 font-display font-bold text-lg">VS</span>
                {nextMatch.court && (
                  <span className="text-[10px] text-white/30">{nextMatch.court}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <Avatar name={nextMatch.player2?.name ?? "?"} size="md" />
                <span className="text-xs font-semibold text-white/80 text-center leading-tight">
                  {nextMatch.player2?.name?.split(" ")[0] ?? "A definir"}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Status stats */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/35">
              Status
            </span>
            <span className="text-[10px] text-white/25 font-semibold">
              {standing?.matches_played ?? 0} partida(s)
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: <CheckCircle2 size={16} className="text-lime-500" />, label: "Vitória", value: wins,    color: "text-lime-500" },
              { icon: <Clock        size={16} className="text-amber-400" />, label: "Pend.",  value: pending, color: "text-amber-400" },
              { icon: <XCircle      size={16} className="text-red-400"   />, label: "Derrota",value: losses,  color: "text-red-400" },
              { icon: <Minus        size={16} className="text-white/25"  />, label: "WO",     value: wo,      color: "text-white/40" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 bg-surface-3 rounded-xl py-3">
                {icon}
                <span className={`text-xl font-display font-bold ${color}`}>{value}</span>
                <span className="text-[9px] text-white/25 font-semibold uppercase tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <div>
          <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/25 mb-3 block px-1">
            Ações
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/calendario">
              <div className="bg-green-900 border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform">
                <Calendar size={20} className="text-lime-500" />
                <span className="text-white/70 text-[11px] font-semibold text-center leading-tight">
                  Calendário
                </span>
              </div>
            </Link>
            <Link href="/partidas/novo">
              <div className="bg-lime-500 rounded-2xl p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform shadow-glow">
                <ClipboardEdit size={20} className="text-surface-0" />
                <span className="text-surface-0 text-[11px] font-bold text-center leading-tight">
                  Resultado
                </span>
              </div>
            </Link>
            <Link href="/ranking">
              <div className="bg-surface-3 border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform">
                <BarChart2 size={20} className="text-white/50" />
                <span className="text-white/50 text-[11px] font-semibold text-center leading-tight">
                  Ranking
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Match history */}
        <Card padding="none">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/35">
              Histórico
            </span>
            <Link
              href="/calendario"
              className="text-lime-500/70 text-xs font-semibold flex items-center gap-0.5 hover:text-lime-500 transition-colors"
            >
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentMatches.length === 0 && (
              <p className="text-center text-white/25 text-sm py-8 px-4">
                Nenhuma partida jogada ainda
              </p>
            )}
            {recentMatches.map((match) => {
              const opponent     = match.player1_id === player.id ? match.player2 : match.player1;
              const result       = getMatchResult(match, player.id);
              const score        = match.status === "wo" ? "WO" : getSetScore(match, player.id);
              const resultLabel  = { victory: "Vitória", defeat: "Derrota", wo: "WO", pending: "Pendente" }[result];

              return (
                <div key={match.id} className="flex items-center px-4 py-3 gap-3">
                  <Avatar name={opponent?.name ?? "?"} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/80 truncate">
                      vs {opponent?.name}
                    </p>
                    <p className="text-xs text-white/25">
                      {match.scheduled_at
                        ? format(new Date(match.scheduled_at), "d MMM", { locale: ptBR })
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-display font-bold ${
                        result === "victory"
                          ? "text-lime-500"
                          : result === "defeat"
                          ? "text-red-400"
                          : "text-white/30"
                      }`}
                    >
                      {score}
                    </span>
                    <Badge variant={result}>{resultLabel}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Standing */}
        {standing && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-display font-bold uppercase tracking-widest text-white/35">
                {player.group_letter ? `Grupo ${player.group_letter}` : "Grupo"}
              </span>
              <Link
                href="/grupos"
                className="text-lime-500/70 text-xs font-semibold flex items-center gap-0.5 hover:text-lime-500 transition-colors"
              >
                Ver grupo <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="font-display font-bold text-5xl text-lime-500 lime-glow leading-none">
                  {standing.position}
                </span>
                <span className="text-white/25 text-[10px] uppercase tracking-wider mt-1">
                  Posição
                </span>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Pts", value: standing.points },
                  { label: "V",   value: standing.wins },
                  { label: "D",   value: standing.losses },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-3 rounded-xl py-3">
                    <p className="text-xl font-display font-bold text-white/80">{value}</p>
                    <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wide">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
