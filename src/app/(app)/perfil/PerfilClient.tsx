"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LogOut, Trophy, Target, Layers, TrendingUp } from "lucide-react";
import type { Player, Standing } from "@/types";

interface Props {
  player: Player;
  standing: Standing | null;
  matchCount: number;
}

export function PerfilClient({ player, standing, matchCount }: Props) {
  const router = useRouter();
  const winRate = matchCount > 0 && standing
    ? Math.round((standing.wins / matchCount) * 100)
    : 0;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const stats = [
    { icon: <Trophy size={18} className="text-amber-400" />, label: "Vitórias", value: standing?.wins ?? 0 },
    { icon: <Target size={18} className="text-clay-400" />, label: "Aproveitamento", value: `${winRate}%` },
    { icon: <Layers size={18} className="text-blue-400" />, label: "Sets ganhos", value: standing ? `${standing.sets_won}-${standing.sets_lost}` : "0-0" },
    { icon: <TrendingUp size={18} className="text-green-500" />, label: "Pontos", value: standing?.points ?? 0 },
  ];

  return (
    <div className="animate-slide-up">
      <div className="bg-green-900 px-4 pt-6 pb-10 flex flex-col items-center gap-3">
        <Avatar name={player.name} src={player.avatar_url} size="xl" />
        <div className="text-center">
          <h1 className="text-white font-black text-2xl">{player.name}</h1>
          <p className="text-clay-400 text-sm font-bold mt-0.5">
            {player.group_letter ? `Grupo ${player.group_letter}` : "Sem grupo"}{standing ? ` · ${standing.position}º no ranking` : ""}
          </p>
        </div>
      </div>

      <div className="px-4 -mt-6 pb-8 space-y-3">
        <Card className="border border-gray-100">
          <div className="grid grid-cols-2 gap-3">
            {stats.map(({ icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                {icon}
                <div>
                  <p className="text-lg font-black text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {standing && (
          <Card className="border border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              Desempenho no Grupo {player.group_letter ?? "—"}
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Pontos", value: standing.points },
                { label: "V", value: standing.wins },
                { label: "D", value: standing.losses },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-gray-800">{value}</p>
                  <p className="text-[10px] text-gray-400 font-semibold">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-sm font-bold text-gray-700">{standing.sets_won}-{standing.sets_lost}</p>
                <p className="text-[10px] text-gray-400">Saldo de Sets</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-2">
                <p className="text-sm font-bold text-gray-700">{standing.games_won}-{standing.games_lost}</p>
                <p className="text-[10px] text-gray-400">Saldo de Games</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Informações</p>
          <div className="space-y-2">
            {[
              { label: "Nome", value: player.name },
              { label: "Grupo", value: player.group_letter ? `Grupo ${player.group_letter}` : "Sem grupo" },
              { label: "Partidas", value: String(matchCount) },
              { label: "Status", value: "Ativo" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-xs text-gray-400">{label}</span>
                <span className="text-xs font-semibold text-gray-700">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Button variant="outline" fullWidth onClick={handleLogout}
          className="border-red-200 text-red-500 hover:bg-red-50">
          <LogOut size={16} />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
