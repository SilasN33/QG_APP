"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  CURRENT_PLAYER,
  MOCK_MATCHES,
  MOCK_STANDINGS,
} from "@/lib/mock-data";
import {
  Calendar,
  ClipboardEdit,
  BarChart2,
  CheckCircle2,
  Clock,
  XCircle,
  Minus,
  ChevronRight,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function getMatchResult(
  matchWinnerId: string | null,
  playerId: string,
  status: string
): "victory" | "defeat" | "wo" | "pending" {
  if (status === "scheduled") return "pending";
  if (status === "wo") return "wo";
  if (!matchWinnerId) return "pending";
  return matchWinnerId === playerId ? "victory" : "defeat";
}

function getSetScore(match: (typeof MOCK_MATCHES)[0], playerId: string) {
  const p1 = match.player1_id === playerId;
  const setsWon = match.sets.filter((s) =>
    p1 ? s.player1_games > s.player2_games : s.player2_games > s.player1_games
  ).length;
  const setsLost = match.sets.filter((s) =>
    p1 ? s.player2_games > s.player1_games : s.player1_games > s.player2_games
  ).length;
  return `${setsWon}-${setsLost}`;
}

export default function DashboardPage() {
  const player = CURRENT_PLAYER;
  const standing = MOCK_STANDINGS.find((s) => s.player.id === player.id)!;

  const myMatches = MOCK_MATCHES.filter(
    (m) => m.player1_id === player.id || m.player2_id === player.id
  );
  const nextMatch = myMatches.find((m) => m.status === "scheduled");
  const recentMatches = myMatches
    .filter((m) => m.status === "completed" || m.status === "wo")
    .slice(-3)
    .reverse();

  const wins = myMatches.filter(
    (m) => m.winner_id === player.id
  ).length;
  const losses = myMatches.filter(
    (m) =>
      m.winner_id && m.winner_id !== player.id && m.status === "completed"
  ).length;
  const pending = myMatches.filter((m) => m.status === "scheduled").length;
  const wo = myMatches.filter((m) => m.status === "wo").length;

  return (
    <div className="animate-slide-up">
      {/* Player Hero */}
      <div className="bg-green-900 px-4 pt-4 pb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar name={player.name} size="xl" />
            <span className="absolute -bottom-1 -right-1 bg-clay-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
              {standing.position}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-white font-black text-lg leading-tight">
              {player.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-clay-400 text-sm font-bold flex items-center gap-1">
                <Crown size={12} />
                Ranking {standing.position}
              </span>
            </div>
          </div>
          <span className="bg-green-800 border border-green-700 text-green-200 text-xs font-bold px-3 py-1.5 rounded-xl">
            Grupo {player.group_letter}
          </span>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-3 pb-4">
        {/* Next Match */}
        {nextMatch && (
          <Card className="border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Próximo Jogo
              </span>
              <span className="text-clay-500 text-xs font-bold">
                {nextMatch.scheduled_at
                  ? format(new Date(nextMatch.scheduled_at), "d MMM • HH:mm", {
                      locale: ptBR,
                    })
                  : "A definir"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex flex-col items-center gap-1">
                <Avatar
                  name={nextMatch.player1?.name ?? ""}
                  size="md"
                />
                <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                  {nextMatch.player1?.name.split(" ")[0]}
                </span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-gray-300 font-black text-lg">VS</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {nextMatch.court}
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <Avatar
                  name={nextMatch.player2?.name ?? ""}
                  size="md"
                />
                <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                  {nextMatch.player2?.name.split(" ")[0]}
                </span>
              </div>
            </div>
            {nextMatch.group_letter && (
              <p className="text-center text-[11px] text-gray-400 mt-2">
                Grupo {nextMatch.group_letter} • {nextMatch.court}
              </p>
            )}
          </Card>
        )}

        {/* Round Status */}
        <Card className="border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Status da Rodada
            </span>
            <span className="text-[10px] text-gray-400 font-semibold">
              {standing.matches_played}ª Rodada
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                icon: <CheckCircle2 size={18} className="text-green-700" />,
                label: "Vitória",
                value: wins,
                color: "text-green-700",
              },
              {
                icon: <Clock size={18} className="text-amber-500" />,
                label: "Pendente",
                value: pending,
                color: "text-amber-500",
              },
              {
                icon: <XCircle size={18} className="text-clay-500" />,
                label: "Derrota",
                value: losses,
                color: "text-clay-500",
              },
              {
                icon: <Minus size={18} className="text-gray-400" />,
                label: "WO",
                value: wo,
                color: "text-gray-400",
              },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                {icon}
                <span className={`text-xl font-black ${color}`}>{value}</span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block px-1">
            Ações Rápidas
          </span>
          <div className="grid grid-cols-3 gap-3">
            <Link href="/calendario">
              <div className="bg-green-900 rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <Calendar size={22} className="text-green-200" />
                <span className="text-green-100 text-[11px] font-bold text-center leading-tight">
                  Informar Disponibilidade
                </span>
              </div>
            </Link>
            <Link href="/partidas/novo">
              <div className="bg-clay-500 rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                <ClipboardEdit size={22} className="text-white" />
                <span className="text-white text-[11px] font-bold text-center leading-tight">
                  Registrar Resultado
                </span>
              </div>
            </Link>
            <Link href="/ranking">
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform shadow-card">
                <BarChart2 size={22} className="text-green-800" />
                <span className="text-green-900 text-[11px] font-bold text-center leading-tight">
                  Ver Ranking
                </span>
              </div>
            </Link>
          </div>
        </div>

        {/* Match History */}
        <Card className="border border-gray-100" padding="none">
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Histórico de Partidas
            </span>
            <Link
              href="/calendario"
              className="text-clay-500 text-xs font-semibold flex items-center gap-0.5"
            >
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMatches.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6 px-4">
                Nenhuma partida jogada ainda
              </p>
            )}
            {recentMatches.map((match) => {
              const opponent =
                match.player1_id === player.id
                  ? match.player2
                  : match.player1;
              const result = getMatchResult(
                match.winner_id,
                player.id,
                match.status
              );
              const score =
                match.status === "wo"
                  ? "WO"
                  : getSetScore(match, player.id);
              const resultLabel = {
                victory: "VITÓRIA",
                defeat: "DERROTA",
                wo: "WO",
                pending: "PENDENTE",
              }[result];

              return (
                <div
                  key={match.id}
                  className="flex items-center px-4 py-3 gap-3"
                >
                  <Avatar name={opponent?.name ?? ""} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      vs {opponent?.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {match.scheduled_at
                        ? format(new Date(match.scheduled_at), "d MMM", {
                            locale: ptBR,
                          })
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black ${
                        result === "victory"
                          ? "text-green-700"
                          : result === "defeat"
                          ? "text-clay-500"
                          : "text-gray-400"
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

        {/* Group Standing */}
        <Card className="border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Posição no Grupo {player.group_letter}
            </span>
            <Link
              href="/grupos"
              className="text-clay-500 text-xs font-semibold flex items-center gap-0.5"
            >
              Ver grupo <ChevronRight size={12} />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-4xl font-black text-green-900">
                {standing.position}º
              </span>
              <span className="text-[10px] text-gray-400 font-medium">
                Posição
              </span>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Pts", value: standing.points },
                { label: "V", value: standing.wins },
                { label: "D", value: standing.losses },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-2">
                  <p className="text-lg font-black text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
