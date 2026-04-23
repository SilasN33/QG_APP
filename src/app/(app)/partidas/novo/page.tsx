"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MOCK_MATCHES, CURRENT_PLAYER } from "@/lib/mock-data";
import { cn } from "@/utils/cn";
import { ChevronLeft, Check, Minus, Plus } from "lucide-react";
import type { Match } from "@/types";

const myPendingMatches = MOCK_MATCHES.filter(
  (m) =>
    (m.player1_id === CURRENT_PLAYER.id ||
      m.player2_id === CURRENT_PLAYER.id) &&
    m.status === "scheduled"
);

interface SetScore {
  p1: number;
  p2: number;
}

function ScoreInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          <Minus size={14} />
        </button>
        <span className="text-2xl font-black text-gray-900 w-8 text-center">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(7, value + 1))}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-95 transition-transform"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export default function NovaPartidaPage() {
  const router = useRouter();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [sets, setSets] = useState<SetScore[]>([{ p1: 0, p2: 0 }]);
  const [isWo, setIsWo] = useState(false);
  const [woWinner, setWoWinner] = useState<"p1" | "p2" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateSet(idx: number, field: "p1" | "p2", value: number) {
    setSets((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  function addSet() {
    if (sets.length < 3) setSets((prev) => [...prev, { p1: 0, p2: 0 }]);
  }

  function removeSet(idx: number) {
    if (sets.length > 1) setSets((prev) => prev.filter((_, i) => i !== idx));
  }

  function computeWinner() {
    if (isWo) return woWinner;
    const p1SetsWon = sets.filter((s) => s.p1 > s.p2).length;
    const p2SetsWon = sets.filter((s) => s.p2 > s.p1).length;
    if (p1SetsWon > p2SetsWon) return "p1";
    if (p2SetsWon > p1SetsWon) return "p2";
    return null;
  }

  async function handleSubmit() {
    if (!selectedMatch) return;
    const winner = computeWinner();
    if (!isWo && !winner) return;

    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4F6F5] flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-20 h-20 rounded-full bg-green-900 flex items-center justify-center shadow-card-lg">
          <Check size={36} className="text-green-100" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">
          Resultado registrado!
        </h2>
        <p className="text-gray-500 text-sm text-center">
          O resultado foi salvo com sucesso.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="bg-green-900 px-4 pt-4 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center text-green-200"
          >
            <ChevronLeft size={22} />
          </button>
          <h1 className="text-white font-black text-lg">
            Registrar Resultado
          </h1>
        </div>
      </div>

      <div className="px-4 pt-3 pb-8 space-y-4">
        {/* Select match */}
        <Card className="border border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Selecionar Partida
          </p>
          {myPendingMatches.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Nenhuma partida pendente
            </p>
          ) : (
            <div className="space-y-2">
              {myPendingMatches.map((match) => {
                const isSelected = selectedMatch?.id === match.id;
                return (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatch(isSelected ? null : match)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                      isSelected
                        ? "border-clay-500 bg-clay-50"
                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                    )}
                  >
                    <Avatar name={match.player1?.name ?? ""} size="sm" />
                    <span className="text-xs font-semibold text-gray-600">
                      {match.player1?.name.split(" ")[0]}
                    </span>
                    <span className="text-gray-300 font-bold text-xs flex-1 text-center">
                      VS
                    </span>
                    <span className="text-xs font-semibold text-gray-600">
                      {match.player2?.name.split(" ")[0]}
                    </span>
                    <Avatar name={match.player2?.name ?? ""} size="sm" />
                    {isSelected && (
                      <Check size={16} className="text-clay-500 ml-1 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {selectedMatch && (
          <>
            {/* WO toggle */}
            <Card className="border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Walkover (WO)
                  </p>
                  <p className="text-xs text-gray-400">
                    Marque se houve ausência
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsWo(!isWo);
                    setWoWinner(null);
                  }}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative",
                    isWo ? "bg-clay-500" : "bg-gray-200"
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
                  <p className="text-xs text-gray-500 mb-2">
                    Quem recebeu o WO (vencedor)?
                  </p>
                  <div className="flex gap-2">
                    {(["p1", "p2"] as const).map((side) => {
                      const player =
                        side === "p1" ? selectedMatch.player1 : selectedMatch.player2;
                      return (
                        <button
                          key={side}
                          onClick={() => setWoWinner(side)}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                            woWinner === side
                              ? "border-green-700 bg-green-50"
                              : "border-gray-100 bg-gray-50"
                          )}
                        >
                          <Avatar name={player?.name ?? ""} size="xs" />
                          <span className="text-xs font-bold text-gray-700">
                            {player?.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Sets */}
            {!isWo && (
              <Card className="border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Placar dos Sets
                  </p>
                  {sets.length < 3 && (
                    <button
                      onClick={addSet}
                      className="text-xs text-clay-500 font-bold flex items-center gap-1"
                    >
                      <Plus size={12} /> Set {sets.length + 1}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {sets.map((set, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500">
                          {idx + 1}º Set
                        </span>
                        {sets.length > 1 && (
                          <button
                            onClick={() => removeSet(idx)}
                            className="text-[10px] text-gray-400 font-medium"
                          >
                            remover
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                        <div className="flex-1 flex items-center gap-2">
                          <Avatar
                            name={selectedMatch.player1?.name ?? ""}
                            size="xs"
                          />
                          <span className="text-xs font-semibold text-gray-700 truncate flex-1">
                            {selectedMatch.player1?.name.split(" ")[0]}
                          </span>
                        </div>
                        <ScoreInput
                          label=""
                          value={set.p1}
                          onChange={(v) => updateSet(idx, "p1", v)}
                        />
                        <span className="text-gray-300 font-black text-sm">
                          –
                        </span>
                        <ScoreInput
                          label=""
                          value={set.p2}
                          onChange={(v) => updateSet(idx, "p2", v)}
                        />
                        <div className="flex-1 flex items-center gap-2 justify-end">
                          <span className="text-xs font-semibold text-gray-700 truncate flex-1 text-right">
                            {selectedMatch.player2?.name.split(" ")[0]}
                          </span>
                          <Avatar
                            name={selectedMatch.player2?.name ?? ""}
                            size="xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Result preview */}
                {(() => {
                  const winner = computeWinner();
                  if (!winner) return null;
                  const name =
                    winner === "p1"
                      ? selectedMatch.player1?.name
                      : selectedMatch.player2?.name;
                  return (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500">Vencedor</p>
                      <p className="text-sm font-black text-green-800">
                        {name}
                      </p>
                    </div>
                  );
                })()}
              </Card>
            )}

            {/* Submit */}
            <Button
              fullWidth
              size="lg"
              onClick={handleSubmit}
              disabled={
                submitting ||
                (!isWo && computeWinner() === null) ||
                (isWo && !woWinner)
              }
              className="font-black tracking-wide"
            >
              {submitting ? "Salvando..." : "Confirmar Resultado"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
