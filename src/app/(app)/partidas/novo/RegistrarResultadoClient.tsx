"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";
import { ChevronLeft, Check, Minus, Plus } from "lucide-react";
import type { Match, Player } from "@/types";

interface SetScore { p1: number; p2: number }

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-8 h-8 rounded-full bg-surface-3 border border-white/[0.08] flex items-center justify-center text-white/50 active:scale-95 transition-transform hover:bg-surface-4"
      >
        <Minus size={14} />
      </button>
      <span className="text-2xl font-display font-bold text-white/90 w-8 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(7, value + 1))}
        className="w-8 h-8 rounded-full bg-surface-3 border border-white/[0.08] flex items-center justify-center text-white/50 active:scale-95 transition-transform hover:bg-surface-4"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

interface Props {
  player:         Player;
  pendingMatches: Match[];
}

export function RegistrarResultadoClient({ pendingMatches }: Props) {
  const router = useRouter();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [sets,          setSets]          = useState<SetScore[]>([{ p1: 0, p2: 0 }]);
  const [isWo,          setIsWo]          = useState(false);
  const [woWinner,      setWoWinner]      = useState<"p1" | "p2" | null>(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [success,       setSuccess]       = useState(false);

  function updateSet(idx: number, field: "p1" | "p2", value: number) {
    setSets((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s)));
  }

  function computeWinner(): string | null {
    if (!selectedMatch) return null;
    if (isWo) {
      if (!woWinner) return null;
      return woWinner === "p1" ? selectedMatch.player1_id : selectedMatch.player2_id;
    }
    const p1Won = sets.filter((s) => s.p1 > s.p2).length;
    const p2Won = sets.filter((s) => s.p2 > s.p1).length;
    if (p1Won > p2Won) return selectedMatch.player1_id;
    if (p2Won > p1Won) return selectedMatch.player2_id;
    return null;
  }

  async function handleSubmit() {
    if (!selectedMatch) return;
    const winnerId = computeWinner();
    if (!winnerId) return;

    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: matchError } = await supabase
      .from("matches")
      .update({ winner_id: winnerId, status: isWo ? "wo" : "completed" })
      .eq("id", selectedMatch.id);

    if (matchError) {
      setError("Erro ao salvar o resultado. Tente novamente.");
      setSubmitting(false);
      return;
    }

    if (!isWo) {
      const setsToInsert = sets
        .filter((s) => s.p1 > 0 || s.p2 > 0)
        .map((s, i) => ({
          match_id:      selectedMatch.id,
          set_number:    i + 1,
          player1_games: s.p1,
          player2_games: s.p2,
        }));

      if (setsToInsert.length > 0) {
        const { error: setsError } = await supabase.from("match_sets").insert(setsToInsert);
        if (setsError) {
          setError("Resultado salvo, mas erro nos sets.");
          setSubmitting(false);
          return;
        }
      }
    }

    setSuccess(true);
    setTimeout(() => { router.push("/dashboard"); router.refresh(); }, 1500);
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-20 h-20 rounded-full bg-lime-500/15 border border-lime-500/30 flex items-center justify-center shadow-glow">
          <Check size={36} className="text-lime-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-white">Resultado registrado!</h2>
        <p className="text-white/35 text-sm text-center">O resultado foi salvo com sucesso.</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="bg-green-900 px-4 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-display font-bold text-white text-lg">Registrar Resultado</h1>
        </div>
      </div>

      <div className="px-4 pt-3 pb-8 space-y-3">
        {/* Select match */}
        <Card>
          <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30 mb-3">
            Selecionar Partida
          </p>
          {pendingMatches.length === 0 ? (
            <p className="text-sm text-white/25 text-center py-6">Nenhuma partida pendente</p>
          ) : (
            <div className="space-y-2">
              {pendingMatches.map((match) => {
                const isSelected = selectedMatch?.id === match.id;
                return (
                  <button
                    key={match.id}
                    onClick={() => { setSelectedMatch(isSelected ? null : match); setError(null); }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-lime-500/50 bg-lime-500/[0.06]"
                        : "border-white/[0.06] bg-surface-3 hover:border-white/15"
                    )}
                  >
                    <Avatar name={match.player1?.name ?? ""} size="sm" />
                    <span className="text-xs font-semibold text-white/70">{match.player1?.name?.split(" ")[0]}</span>
                    <span className="text-white/20 font-display font-bold text-xs flex-1 text-center">VS</span>
                    <span className="text-xs font-semibold text-white/70">{match.player2?.name?.split(" ")[0]}</span>
                    <Avatar name={match.player2?.name ?? ""} size="sm" />
                    {isSelected && <Check size={15} className="text-lime-500 ml-1 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {selectedMatch && (
          <>
            {/* WO toggle */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white/80">Walkover (WO)</p>
                  <p className="text-xs text-white/30">Marque se houve ausência</p>
                </div>
                <button
                  onClick={() => { setIsWo(!isWo); setWoWinner(null); }}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
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
                      const p = side === "p1" ? selectedMatch.player1 : selectedMatch.player2;
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
                          <span className="text-xs font-bold text-white/70">{p?.name?.split(" ")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Sets */}
            {!isWo && (
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-display font-bold uppercase tracking-widest text-white/30">
                    Placar dos Sets
                  </p>
                  {sets.length < 3 && (
                    <button
                      onClick={() => setSets((p) => [...p, { p1: 0, p2: 0 }])}
                      className="text-xs text-lime-500/70 font-bold flex items-center gap-1 hover:text-lime-500 transition-colors"
                    >
                      <Plus size={12} /> Set {sets.length + 1}
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {sets.map((set, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-4 bg-surface-3 border border-white/[0.04] rounded-xl p-3">
                        <div className="flex-1 flex items-center gap-2">
                          <Avatar name={selectedMatch.player1?.name ?? ""} size="xs" />
                          <span className="text-xs font-semibold text-white/60 truncate flex-1">
                            {selectedMatch.player1?.name?.split(" ")[0]}
                          </span>
                        </div>
                        <ScoreInput value={set.p1} onChange={(v) => updateSet(idx, "p1", v)} />
                        <span className="text-white/15 font-black text-sm">–</span>
                        <ScoreInput value={set.p2} onChange={(v) => updateSet(idx, "p2", v)} />
                        <div className="flex-1 flex items-center gap-2 justify-end">
                          <span className="text-xs font-semibold text-white/60 truncate flex-1 text-right">
                            {selectedMatch.player2?.name?.split(" ")[0]}
                          </span>
                          <Avatar name={selectedMatch.player2?.name ?? ""} size="xs" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {(() => {
                  const winnerId = computeWinner();
                  if (!winnerId) return null;
                  const name = winnerId === selectedMatch.player1_id
                    ? selectedMatch.player1?.name
                    : selectedMatch.player2?.name;
                  return (
                    <div className="mt-4 bg-lime-500/[0.08] border border-lime-500/25 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-white/35 uppercase tracking-wider">Vencedor</p>
                      <p className="text-sm font-display font-bold text-lime-400 mt-0.5">{name}</p>
                    </div>
                  );
                })()}
              </Card>
            )}

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                {error}
              </p>
            )}

            <Button
              fullWidth
              size="lg"
              onClick={handleSubmit}
              disabled={submitting || (!isWo && !computeWinner()) || (isWo && !woWinner)}
              className="font-display font-bold tracking-wide"
            >
              {submitting ? "Salvando..." : "Confirmar Resultado"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
