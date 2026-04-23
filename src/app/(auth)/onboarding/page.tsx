"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Player, GroupLetter } from "@/types";
import Image from "next/image";

const GROUP_COLORS: Record<GroupLetter, string> = {
  A: "bg-green-900 text-green-100",
  B: "bg-clay-500 text-white",
  C: "bg-blue-600 text-white",
  D: "bg-amber-600 text-white",
};

export default function OnboardingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selected, setSelected] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"choose" | "confirm">("choose");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("players")
        .select("*")
        .is("user_id", null)
        .order("group_letter")
        .order("name");
      setPlayers((data ?? []) as Player[]);
    }
    load();
  }, [supabase]);

  async function handleConfirm() {
    if (!selected) return;
    setLoading(true);
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Check still unclaimed
    const { data: check } = await supabase
      .from("players")
      .select("user_id")
      .eq("id", selected.id)
      .single();

    if (check?.user_id) {
      setError("Este jogador já foi reivindicado por outra conta. Escolha outro.");
      setSelected(null);
      setStep("choose");
      setLoading(false);
      // Refresh unclaimed list
      const { data } = await supabase
        .from("players")
        .select("*")
        .is("user_id", null)
        .order("group_letter")
        .order("name");
      setPlayers((data ?? []) as Player[]);
      return;
    }

    const { error } = await supabase
      .from("players")
      .update({ user_id: user.id })
      .eq("id", selected.id);

    if (error) {
      setError("Erro ao vincular perfil. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  // Group players by letter
  const groups = (["A", "B", "C", "D"] as GroupLetter[]).map((g) => ({
    letter: g,
    players: players.filter((p) => p.group_letter === g),
  })).filter((g) => g.players.length > 0);

  return (
    <div className="min-h-screen bg-green-900 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-6 px-6">
        <div className="w-16 h-16 rounded-full bg-green-800 border-2 border-green-700 flex items-center justify-center mb-4">
          <Image src="/logo.svg" alt="QG Open" width={44} height={44} />
        </div>
        <h1 className="text-2xl font-black text-white text-center">
          {step === "choose" ? "Quem é você?" : "Confirmar identidade"}
        </h1>
        <p className="text-green-400 text-sm text-center mt-1 max-w-xs">
          {step === "choose"
            ? "Selecione seu nome na lista de jogadores do torneio"
            : "Você está prestes a vincular sua conta a este jogador"}
        </p>
      </div>

      <div className="flex-1 bg-[#F4F6F5] rounded-t-3xl px-4 pt-5 pb-8">
        {error && (
          <div className="mb-4 bg-clay-50 border border-clay-200 text-clay-600 text-sm rounded-xl px-4 py-3 text-center">
            {error}
          </div>
        )}

        {step === "choose" && (
          <>
            {players.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🎾</p>
                <p className="font-medium">Todos os jogadores já foram vinculados.</p>
                <p className="text-sm mt-1">Entre em contato com o organizador.</p>
              </div>
            )}

            <div className="space-y-4">
              {groups.map(({ letter, players: groupPlayers }) => (
                <div key={letter}>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", GROUP_COLORS[letter])}>
                      GRUPO {letter}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {groupPlayers.map((player) => (
                      <button
                        key={player.id}
                        onClick={() => setSelected(player)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all bg-white",
                          selected?.id === player.id
                            ? "border-clay-500 shadow-md"
                            : "border-gray-100 hover:border-gray-200"
                        )}
                      >
                        <Avatar name={player.name} size="md" />
                        <div className="flex-1 text-left">
                          <p className="font-bold text-gray-800 text-sm">{player.name}</p>
                          <p className="text-xs text-gray-400">Grupo {player.group_letter}</p>
                        </div>
                        {selected?.id === player.id ? (
                          <Check size={18} className="text-clay-500 shrink-0" />
                        ) : (
                          <ChevronRight size={16} className="text-gray-300 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Button
                fullWidth
                size="lg"
                disabled={!selected}
                onClick={() => setStep("confirm")}
                className="font-bold"
              >
                Continuar
              </Button>
            </div>
          </>
        )}

        {step === "confirm" && selected && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-white rounded-2xl p-6 w-full flex flex-col items-center gap-3 shadow-card border border-gray-100">
              <Avatar name={selected.name} size="xl" />
              <div className="text-center">
                <p className="text-xl font-black text-gray-900">{selected.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">Grupo {selected.group_letter}</p>
              </div>
              <span className={cn("text-xs font-bold px-3 py-1 rounded-full", GROUP_COLORS[selected.group_letter as GroupLetter])}>
                GRUPO {selected.group_letter}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 w-full">
              <p className="text-amber-700 text-sm text-center font-medium">
                ⚠️ Esta ação é permanente. Certifique-se de que este é você.
              </p>
            </div>

            <div className="w-full space-y-3">
              <Button fullWidth size="lg" onClick={handleConfirm} disabled={loading} className="font-bold">
                {loading ? "Vinculando..." : "Sim, sou eu!"}
              </Button>
              <Button
                fullWidth
                size="lg"
                variant="ghost"
                onClick={() => setStep("choose")}
                disabled={loading}
                className="text-gray-500"
              >
                Escolher outro jogador
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
