"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import type { Player, GroupLetter } from "@/types";
import { Check, Loader2 } from "lucide-react";

const GROUP_OPTIONS: (GroupLetter | null)[] = [null, "A", "B", "C", "D"];

const GROUP_COLORS: Record<string, string> = {
  A: "bg-green-900 text-green-100",
  B: "bg-clay-500 text-white",
  C: "bg-blue-600 text-white",
  D: "bg-amber-600 text-white",
};

interface Props {
  players: Player[];
}

export function AdminJogadoresClient({ players: initialPlayers }: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function assignGroup(playerId: string, group: GroupLetter | null) {
    setSaving((prev) => ({ ...prev, [playerId]: true }));

    const supabase = createClient();
    await supabase
      .from("players")
      .update({ group_letter: group })
      .eq("id", playerId);

    setPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, group_letter: group } : p))
    );
    setSaving((prev) => ({ ...prev, [playerId]: false }));

    startTransition(() => router.refresh());
  }

  const byGroup: Record<string, Player[]> = { sem_grupo: [] };
  for (const g of ["A", "B", "C", "D"] as GroupLetter[]) byGroup[g] = [];
  for (const p of players) {
    const key = p.group_letter ?? "sem_grupo";
    byGroup[key].push(p);
  }

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h2 className="text-lg font-black text-gray-900">Jogadores</h2>
        <p className="text-xs text-gray-500 mt-0.5">Atribua cada jogador a um grupo para iniciar o torneio.</p>
      </div>

      {/* Summary badges */}
      <div className="flex gap-2 flex-wrap">
        {(["A", "B", "C", "D"] as GroupLetter[]).map((g) => (
          <span key={g} className={cn("text-[10px] font-black px-2.5 py-1 rounded-full", GROUP_COLORS[g])}>
            Grupo {g}: {byGroup[g].length}
          </span>
        ))}
        {byGroup.sem_grupo.length > 0 && (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gray-200 text-gray-600">
            Sem grupo: {byGroup.sem_grupo.length}
          </span>
        )}
      </div>

      {/* Players without a group first */}
      {byGroup.sem_grupo.length > 0 && (
        <Section title="Sem Grupo" players={byGroup.sem_grupo} saving={saving} onAssign={assignGroup} />
      )}

      {(["A", "B", "C", "D"] as GroupLetter[]).map((g) =>
        byGroup[g].length > 0 ? (
          <Section key={g} title={`Grupo ${g}`} players={byGroup[g]} saving={saving} onAssign={assignGroup} groupColor={GROUP_COLORS[g]} />
        ) : null
      )}

      {players.length === 0 && (
        <p className="text-center text-gray-400 py-12 text-sm">Nenhum jogador cadastrado ainda.</p>
      )}
    </div>
  );
}

function Section({
  title,
  players,
  saving,
  onAssign,
  groupColor,
}: {
  title: string;
  players: Player[];
  saving: Record<string, boolean>;
  onAssign: (id: string, group: GroupLetter | null) => void;
  groupColor?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", groupColor ?? "bg-gray-200 text-gray-600")}>
          {title.toUpperCase()}
        </span>
      </div>
      <div className="space-y-2">
        {players.map((player) => (
          <PlayerRow key={player.id} player={player} saving={!!saving[player.id]} onAssign={onAssign} />
        ))}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  saving,
  onAssign,
}: {
  player: Player;
  saving: boolean;
  onAssign: (id: string, group: GroupLetter | null) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 flex items-center gap-3">
      <Avatar name={player.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">{player.name}</p>
        <p className="text-[10px] text-gray-400">{player.user_id ? "Conta vinculada" : "Sem conta"}</p>
      </div>
      {saving ? (
        <Loader2 size={16} className="text-clay-500 animate-spin shrink-0" />
      ) : (
        <div className="flex gap-1">
          {GROUP_OPTIONS.map((g) => {
            const active = player.group_letter === g;
            return (
              <button
                key={g ?? "none"}
                onClick={() => onAssign(player.id, g)}
                className={cn(
                  "w-7 h-7 rounded-lg text-[10px] font-black transition-all border",
                  active
                    ? g
                      ? cn("border-transparent text-white", GROUP_COLORS[g])
                      : "border-gray-400 bg-gray-200 text-gray-600"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                )}
              >
                {active && !g ? <Check size={10} className="mx-auto" /> : (g ?? "–")}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
