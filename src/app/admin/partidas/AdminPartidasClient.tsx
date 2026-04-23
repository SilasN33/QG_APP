"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import type { Match, Player, GroupLetter } from "@/types";
import { Loader2, Trash2, RefreshCw, AlertTriangle } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  pending_result: "Aguardando resultado",
  completed: "Concluída",
  wo: "WO",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-gray-100 text-gray-500",
  pending_result: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  wo: "bg-clay-100 text-clay-700",
};

const GROUP_COLORS: Record<GroupLetter, string> = {
  A: "bg-green-900 text-green-100",
  B: "bg-clay-500 text-white",
  C: "bg-blue-600 text-white",
  D: "bg-amber-600 text-white",
};

interface Props {
  players: Player[];
  matches: Match[];
}

export function AdminPartidasClient({ players, matches: initialMatches }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Players fully assigned to groups
  const groupPlayers = (g: GroupLetter) => players.filter((p) => p.group_letter === g);
  const readyGroups = (["A", "B", "C", "D"] as GroupLetter[]).filter((g) => groupPlayers(g).length >= 2);
  const groupMatches = (g: GroupLetter) => matches.filter((m) => m.group_letter === g && m.phase === "group");

  async function generateGroupMatches() {
    if (readyGroups.length === 0) {
      setError("Atribua jogadores aos grupos antes de gerar partidas.");
      return;
    }

    setGenerating(true);
    setError(null);
    const supabase = createClient();

    const toInsert: { player1_id: string; player2_id: string; group_letter: string; phase: string; round: number }[] = [];

    for (const g of readyGroups) {
      const gPlayers = groupPlayers(g);
      // Skip group if matches already exist
      if (groupMatches(g).length > 0) continue;

      // Round-robin: every pair plays once
      for (let i = 0; i < gPlayers.length; i++) {
        for (let j = i + 1; j < gPlayers.length; j++) {
          toInsert.push({
            player1_id: gPlayers[i].id,
            player2_id: gPlayers[j].id,
            group_letter: g,
            phase: "group",
            round: 1,
          });
        }
      }
    }

    if (toInsert.length === 0) {
      setError("Partidas já foram geradas para todos os grupos com jogadores.");
      setGenerating(false);
      return;
    }

    const { data, error: insertError } = await supabase
      .from("matches")
      .insert(toInsert)
      .select("*, player1:players!matches_player1_id_fkey(*), player2:players!matches_player2_id_fkey(*)");

    if (insertError) {
      setError("Erro ao gerar partidas. Tente novamente.");
    } else {
      const newMatches = (data ?? []).map((m) => ({ ...m, sets: [] })) as Match[];
      setMatches((prev) => [...prev, ...newMatches]);
    }

    setGenerating(false);
    startTransition(() => router.refresh());
  }

  async function deleteAllGroupMatches() {
    setDeleting(true);
    setError(null);
    const supabase = createClient();

    const groupMatchIds = matches.filter((m) => m.phase === "group").map((m) => m.id);
    if (groupMatchIds.length > 0) {
      await supabase.from("matches").delete().in("id", groupMatchIds);
    }

    setMatches((prev) => prev.filter((m) => m.phase !== "group"));
    setDeleting(false);
    setConfirmDelete(false);
    startTransition(() => router.refresh());
  }

  async function updateMatchStatus(matchId: string, status: string) {
    const supabase = createClient();
    await supabase.from("matches").update({ status }).eq("id", matchId);
    setMatches((prev) =>
      prev.map((m) => (m.id === matchId ? { ...m, status: status as Match["status"] } : m))
    );
    startTransition(() => router.refresh());
  }

  const hasGroupMatches = matches.some((m) => m.phase === "group");

  return (
    <div className="px-4 py-5 space-y-5">
      <div>
        <h2 className="text-lg font-black text-gray-900">Partidas</h2>
        <p className="text-xs text-gray-500 mt-0.5">Gere as partidas da fase de grupos automaticamente.</p>
      </div>

      {/* Generation actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fase de Grupos</p>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{readyGroups.length} grupo(s) com jogadores</span>
          {readyGroups.map((g) => (
            <span key={g} className={cn("px-1.5 py-0.5 rounded font-bold text-[10px]", GROUP_COLORS[g])}>
              {g}
            </span>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-clay-50 border border-clay-200 rounded-xl p-3">
            <AlertTriangle size={14} className="text-clay-500 shrink-0 mt-0.5" />
            <p className="text-xs text-clay-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            fullWidth
            size="sm"
            onClick={generateGroupMatches}
            disabled={generating || readyGroups.length === 0}
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Gerando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw size={14} /> Gerar Partidas de Grupo
              </span>
            )}
          </Button>

          {hasGroupMatches && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:border-clay-300 hover:text-clay-500 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>

        {confirmDelete && (
          <div className="bg-clay-50 border border-clay-200 rounded-xl p-3 space-y-2">
            <p className="text-xs text-clay-700 font-semibold">Apagar todas as partidas de grupo? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} className="flex-1 text-gray-500">
                Cancelar
              </Button>
              <button
                onClick={deleteAllGroupMatches}
                disabled={deleting}
                className="flex-1 bg-clay-500 text-white text-xs font-bold py-2 rounded-xl disabled:opacity-50"
              >
                {deleting ? "Apagando..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Match list per group */}
      {(["A", "B", "C", "D"] as GroupLetter[]).map((g) => {
        const gMatches = groupMatches(g);
        if (gMatches.length === 0) return null;
        return (
          <div key={g}>
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", GROUP_COLORS[g])}>
                GRUPO {g}
              </span>
              <span className="text-[10px] text-gray-400">{gMatches.length} partidas</span>
            </div>
            <div className="space-y-2">
              {gMatches.map((match) => (
                <MatchRow key={match.id} match={match} onStatusChange={updateMatchStatus} />
              ))}
            </div>
          </div>
        );
      })}

      {matches.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">Nenhuma partida gerada ainda.</p>
      )}
    </div>
  );
}

function MatchRow({
  match,
  onStatusChange,
}: {
  match: Match;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-3"
      >
        <Avatar name={match.player1?.name ?? "?"} size="xs" />
        <span className="text-xs font-semibold text-gray-700 truncate">{match.player1?.name?.split(" ")[0]}</span>
        <span className="text-gray-300 text-xs font-black flex-1 text-center">VS</span>
        <span className="text-xs font-semibold text-gray-700 truncate">{match.player2?.name?.split(" ")[0]}</span>
        <Avatar name={match.player2?.name ?? "?"} size="xs" />
        <span className={cn("ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", STATUS_COLORS[match.status])}>
          {STATUS_LABELS[match.status]}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-3 py-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Alterar status</p>
          <div className="flex gap-1.5 flex-wrap">
            {Object.entries(STATUS_LABELS).map(([s, label]) => (
              <button
                key={s}
                onClick={() => { onStatusChange(match.id, s); setOpen(false); }}
                className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-lg border transition-all",
                  match.status === s
                    ? "border-gray-400 bg-gray-100 text-gray-700"
                    : "border-gray-200 text-gray-400 hover:border-gray-300"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
