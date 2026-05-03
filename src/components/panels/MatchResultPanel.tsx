"use client";

import { useState } from "react";
import { Plus, Minus, Check, Loader2, Trophy, Pencil } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { submitMatchResultAction } from "@/lib/actions/submitMatchResult";
import { editMatchResultAction } from "@/lib/actions/editMatchResult";
import type { Match } from "@/types";

interface SetScore {
  p1: number;
  p2: number;
}

function ScoreInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-full bg-surface-3 border border-white/[0.08] flex items-center justify-center text-white/50 active:scale-95 transition-transform hover:bg-surface-4"
      >
        <Minus size={14} />
      </button>
      <span className="text-2xl font-display font-bold text-white/90 w-9 text-center tabular-nums">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(7, value + 1))}
        className="w-9 h-9 rounded-full bg-surface-3 border border-white/[0.08] flex items-center justify-center text-white/50 active:scale-95 transition-transform hover:bg-surface-4"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

interface Props {
  match: Match;
  currentPlayerId: string;
  mode?: "register" | "edit";
  onSuccess: () => void;
}

function getInitialSets(match: Match, mode: "register" | "edit"): SetScore[] {
  if (mode === "edit" && match.sets.length > 0) {
    return match.sets
      .slice()
      .sort((a, b) => a.set_number - b.set_number)
      .map((s) => ({ p1: s.player1_games, p2: s.player2_games }));
  }
  return [{ p1: 0, p2: 0 }];
}

function getInitialWo(match: Match, mode: "register" | "edit"): boolean {
  return mode === "edit" && match.status === "wo";
}

function getInitialWoWinner(
  match: Match,
  mode: "register" | "edit"
): "p1" | "p2" | null {
  if (mode !== "edit" || match.status !== "wo" || !match.winner_id) return null;
  return match.winner_id === match.player1_id ? "p1" : "p2";
}

export function MatchResultPanel({
  match,
  currentPlayerId,
  mode = "register",
  onSuccess,
}: Props) {
  const isEdit = mode === "edit";

  const [sets, setSets] = useState<SetScore[]>(() => getInitialSets(match, mode));
  const [isWo, setIsWo] = useState(() => getInitialWo(match, mode));
  const [woWinner, setWoWinner] = useState<"p1" | "p2" | null>(() =>
    getInitialWoWinner(match, mode)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isParticipant =
    match.player1_id === currentPlayerId || match.player2_id === currentPlayerId;

  function updateSet(idx: number, field: "p1" | "p2", value: number) {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  function computeWinner(): string | null {
    if (isWo) {
      if (!woWinner) return null;
      return woWinner === "p1" ? match.player1_id : match.player2_id;
    }
    const p1Won = sets.filter((s) => s.p1 > s.p2).length;
    const p2Won = sets.filter((s) => s.p2 > s.p1).length;
    if (p1Won > p2Won) return match.player1_id;
    if (p2Won > p1Won) return match.player2_id;
    return null;
  }

  async function handleSubmit() {
    const winnerId = computeWinner();
    if (!winnerId) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      match_id: match.id,
      winner_id: winnerId,
      sets: isWo
        ? []
        : sets
            .filter((s) => s.p1 > 0 || s.p2 > 0)
            .map((s, i) => ({
              set_number: i + 1,
              player1_games: s.p1,
              player2_games: s.p2,
            })),
      is_wo: isWo,
    };

    const { error: err } = isEdit
      ? await editMatchResultAction(payload)
      : await submitMatchResultAction(payload);

    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    }
  }

  const winnerId = computeWinner();
  const winnerName =
    winnerId === match.player1_id ? match.player1?.name : match.player2?.name;

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 px-6">
        <div className="w-16 h-16 rounded-full bg-lime-500/15 border border-lime-500/30 flex items-center justify-center">
          {isEdit ? (
            <Pencil size={28} className="text-lime-500" />
          ) : (
            <Trophy size={28} className="text-lime-500" />
          )}
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-white text-lg">
            {isEdit ? "Resultado atualizado!" : "Resultado registrado!"}
          </p>
          {winnerName && (
            <p className="text-white/40 text-sm mt-1">Vencedor: {winnerName}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pb-8 pt-2">
      {/* Match header */}
      <div className="flex items-center gap-3 bg-surface-3 border border-white/[0.06] rounded-2xl p-4 mb-5">
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <Avatar name={match.player1?.name ?? ""} src={match.player1?.avatar_url} size="sm" />
          <span className="text-sm font-semibold text-white/80 truncate">
            {match.player1?.name?.split(" ")[0]}
          </span>
        </div>
        <span className="text-white/20 font-display font-bold text-xs px-2">VS</span>
        <div className="flex-1 flex items-center gap-2 min-w-0 justify-end">
          <span className="text-sm font-semibold text-white/80 truncate text-right">
            {match.player2?.name?.split(" ")[0]}
          </span>
          <Avatar name={match.player2?.name ?? ""} src={match.player2?.avatar_url} size="sm" />
        </div>
      </div>

      {!isParticipant ? (
        <div className="bg-surface-3 border border-white/[0.06] rounded-xl px-4 py-6 text-center">
          <p className="text-white/40 text-sm">
            Apenas os participantes podem {isEdit ? "editar" : "registrar"} o resultado desta partida.
          </p>
        </div>
      ) : (
        <>
          {/* WO toggle */}
          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white/80">Walkover (WO)</p>
                <p className="text-xs text-white/30 mt-0.5">Marque se houve ausência</p>
              </div>
              <button
                onClick={() => { setIsWo(!isWo); setWoWinner(null); }}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative shrink-0",
                  isWo ? "bg-lime-500" : "bg-surface-4"
                )}
              >
                <span
                  className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all",
                    isWo ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>

            {isWo && (
              <div className="mt-4">
                <p className="text-xs text-white/30 mb-2">Quem recebeu o WO (vencedor)?</p>
                <div className="flex gap-2">
                  {(["p1", "p2"] as const).map((side) => {
                    const p = side === "p1" ? match.player1 : match.player2;
                    return (
                      <button
                        key={side}
                        onClick={() => setWoWinner(side)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                          woWinner === side
                            ? "border-lime-500/50 bg-lime-500/[0.06]"
                            : "border-white/[0.06] bg-surface-3"
                        )}
                      >
                        <Avatar name={p?.name ?? ""} size="xs" />
                        <span className="text-xs font-bold text-white/70 truncate">
                          {p?.name?.split(" ")[0]}
                        </span>
                        {woWinner === side && (
                          <Check size={13} className="text-lime-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sets */}
          {!isWo && (
            <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4 mb-3">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30">
                  Placar dos Sets
                </p>
                {sets.length < 3 && (
                  <button
                    onClick={() => setSets((p) => [...p, { p1: 0, p2: 0 }])}
                    className="text-xs text-lime-500/70 font-bold flex items-center gap-1 hover:text-lime-500 transition-colors"
                  >
                    <Plus size={12} /> {sets.length + 1}º Set
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {sets.map((set, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white/30">{idx + 1}º Set</span>
                      {sets.length > 1 && (
                        <button
                          onClick={() => setSets((p) => p.filter((_, i) => i !== idx))}
                          className="text-[10px] text-white/25 font-medium hover:text-white/50 transition-colors"
                        >
                          remover
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 bg-surface-3 border border-white/[0.04] rounded-xl p-3">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <Avatar name={match.player1?.name ?? ""} size="xs" />
                        <span className="text-xs font-semibold text-white/50 truncate">
                          {match.player1?.name?.split(" ")[0]}
                        </span>
                      </div>
                      <ScoreInput value={set.p1} onChange={(v) => updateSet(idx, "p1", v)} />
                      <span className="text-white/15 font-black text-sm">–</span>
                      <ScoreInput value={set.p2} onChange={(v) => updateSet(idx, "p2", v)} />
                      <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                        <span className="text-xs font-semibold text-white/50 truncate text-right">
                          {match.player2?.name?.split(" ")[0]}
                        </span>
                        <Avatar name={match.player2?.name ?? ""} size="xs" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {winnerId && (
                <div className="mt-4 bg-lime-500/[0.08] border border-lime-500/25 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-white/35 uppercase tracking-wider">Vencedor</p>
                  <p className="text-sm font-display font-bold text-lime-400 mt-0.5">{winnerName}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || (!isWo && !winnerId) || (isWo && !woWinner)}
            className="font-display font-bold tracking-wide"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Salvando...</>
            ) : isEdit ? (
              "Salvar Alterações"
            ) : (
              "Confirmar e Encerrar Partida"
            )}
          </Button>
        </>
      )}
    </div>
  );
}
