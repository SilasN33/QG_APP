"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { MOCK_MATCHES, MOCK_PLAYERS } from "@/lib/mock-data";
import { cn } from "@/utils/cn";
import { Trophy } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type BracketType = "principal" | "consolacao";

interface BracketMatchProps {
  player1Name?: string;
  player2Name?: string;
  winnerId?: string | null;
  player1Id?: string;
  player2Id?: string;
  date?: string | null;
  isPlaceholder?: boolean;
}

function BracketMatch({
  player1Name = "A definir",
  player2Name = "A definir",
  winnerId,
  player1Id,
  player2Id,
  date,
  isPlaceholder,
}: BracketMatchProps) {
  const isCompleted = !!winnerId;
  return (
    <div
      className={cn(
        "bg-white rounded-xl border shadow-sm overflow-hidden w-36",
        isPlaceholder && "opacity-40"
      )}
    >
      {date && (
        <div className="bg-gray-50 border-b border-gray-100 px-2 py-0.5 text-[9px] text-gray-400 font-medium text-center">
          {format(new Date(date), "d MMM · HH:mm", { locale: ptBR })}
        </div>
      )}
      {[
        { name: player1Name, id: player1Id },
        { name: player2Name, id: player2Id },
      ].map(({ name, id }, i) => {
        const isWinner = isCompleted && id === winnerId;
        const isLoser = isCompleted && id && id !== winnerId;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-1.5 px-2 py-1.5 border-b border-gray-50 last:border-0",
              isWinner && "bg-green-50",
              isLoser && "opacity-50"
            )}
          >
            <Avatar name={name} size="xs" />
            <span
              className={cn(
                "text-[11px] font-semibold truncate flex-1",
                isWinner ? "text-green-800 font-bold" : "text-gray-700"
              )}
            >
              {name === "A definir" ? (
                <span className="text-gray-300 italic text-[10px]">A definir</span>
              ) : (
                name.split(" ")[0]
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ChaveamentoPage() {
  const [activeTab, setActiveTab] = useState<BracketType>("principal");

  // Quarterfinal matches
  const qf = MOCK_MATCHES.filter((m) => m.phase === "quarterfinals");

  // Placeholder semi and final for display
  const semis = [
    { player1Name: qf[0]?.player1?.name, player2Name: qf[1]?.player1?.name, date: "2026-05-23T17:00:00" },
    { player1Name: qf[2]?.player2?.name, player2Name: qf[3]?.player1?.name, date: "2026-05-23T19:00:00" },
  ];

  const consolacaoPlayers = [
    MOCK_PLAYERS.find((p) => p.id === "p3"),
    MOCK_PLAYERS.find((p) => p.id === "p4"),
    MOCK_PLAYERS.find((p) => p.id === "p7"),
    MOCK_PLAYERS.find((p) => p.id === "p8"),
    MOCK_PLAYERS.find((p) => p.id === "p11"),
    MOCK_PLAYERS.find((p) => p.id === "p12"),
    MOCK_PLAYERS.find((p) => p.id === "p15"),
    MOCK_PLAYERS.find((p) => p.id === "p16"),
  ];

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="bg-green-900 px-4 pt-4 pb-5">
        <h1 className="text-white font-black text-xl mb-4">Chaveamento</h1>
        <div className="flex bg-green-800/60 rounded-xl p-1 gap-1">
          {(["principal", "consolacao"] as BracketType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === tab
                  ? "bg-clay-500 text-white shadow"
                  : "text-green-300"
              )}
            >
              {tab === "principal" ? "Principal" : "Consolação"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 pb-6">
        {activeTab === "principal" ? (
          <div>
            {/* Round headers */}
            <div className="flex gap-2 mb-3 pl-1">
              <div className="w-36 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Quartas
                </span>
                <p className="text-[9px] text-gray-300">22 Mai</p>
              </div>
              <div className="w-4" />
              <div className="w-36 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Semifinais
                </span>
                <p className="text-[9px] text-gray-300">23 Mai</p>
              </div>
              <div className="w-4" />
              <div className="w-36 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Final
                </span>
                <p className="text-[9px] text-gray-300">24 Mai</p>
              </div>
            </div>

            {/* Bracket */}
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-0 min-w-max">
                {/* Quarterfinals column */}
                <div className="flex flex-col gap-8 justify-around py-2">
                  {qf.slice(0, 4).map((m) => (
                    <BracketMatch
                      key={m.id}
                      player1Name={m.player1?.name}
                      player2Name={m.player2?.name}
                      player1Id={m.player1_id}
                      player2Id={m.player2_id}
                      winnerId={m.winner_id}
                      date={m.scheduled_at}
                    />
                  ))}
                  {qf.length < 4 &&
                    Array.from({ length: 4 - qf.length }).map((_, i) => (
                      <BracketMatch key={`ph-${i}`} isPlaceholder />
                    ))}
                </div>

                {/* Connectors QF → SF */}
                <div className="flex flex-col justify-around py-2">
                  <div className="flex flex-col items-start" style={{ height: "50%" }}>
                    <div className="flex-1 border-r border-t border-gray-200 w-4 rounded-tr-md" />
                    <div className="w-4 h-px bg-gray-200" />
                    <div className="flex-1 border-r border-b border-gray-200 w-4 rounded-br-md" />
                  </div>
                  <div className="flex flex-col items-start" style={{ height: "50%" }}>
                    <div className="flex-1 border-r border-t border-gray-200 w-4 rounded-tr-md" />
                    <div className="w-4 h-px bg-gray-200" />
                    <div className="flex-1 border-r border-b border-gray-200 w-4 rounded-br-md" />
                  </div>
                </div>

                {/* Semifinals column */}
                <div className="flex flex-col gap-8 justify-around py-16">
                  {semis.map((s, i) => (
                    <BracketMatch
                      key={i}
                      player1Name={s.player1Name}
                      player2Name={s.player2Name}
                      date={s.date}
                    />
                  ))}
                </div>

                {/* Connectors SF → F */}
                <div className="flex flex-col justify-around py-16">
                  <div className="flex flex-col items-start" style={{ height: "100%" }}>
                    <div className="flex-1 border-r border-t border-gray-200 w-4 rounded-tr-md" />
                    <div className="w-4 h-px bg-gray-200" />
                    <div className="flex-1 border-r border-b border-gray-200 w-4 rounded-br-md" />
                  </div>
                </div>

                {/* Final column */}
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <BracketMatch date="2026-05-24T17:00:00" />
                    <div className="flex flex-col items-center gap-1 mt-2">
                      <Trophy size={24} className="text-amber-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        Final
                      </span>
                      <span className="text-[9px] text-gray-300">
                        24 Mai · 17:00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 text-center text-[10px] text-gray-400">
              Toque nos jogos para ver detalhes
            </div>
          </div>
        ) : (
          /* Consolação bracket */
          <div>
            <div className="flex gap-2 mb-3 pl-1">
              {["Quartas", "Semis", "Final"].map((r, i) => (
                <div key={r} className={cn("text-center", i < 2 ? "w-36" : "w-28")}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {r}
                  </span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex gap-0 min-w-max">
                {/* Consolação QF */}
                <div className="flex flex-col gap-8 justify-around py-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <BracketMatch
                      key={i}
                      player1Name={consolacaoPlayers[i * 2]?.name}
                      player2Name={consolacaoPlayers[i * 2 + 1]?.name}
                      isPlaceholder={!consolacaoPlayers[i * 2]}
                    />
                  ))}
                </div>

                {/* Connectors */}
                <div className="flex flex-col justify-around py-2">
                  <div className="flex flex-col items-start" style={{ height: "50%" }}>
                    <div className="flex-1 border-r border-t border-gray-200 w-4 rounded-tr-md" />
                    <div className="w-4 h-px bg-gray-200" />
                    <div className="flex-1 border-r border-b border-gray-200 w-4 rounded-br-md" />
                  </div>
                  <div className="flex flex-col items-start" style={{ height: "50%" }}>
                    <div className="flex-1 border-r border-t border-gray-200 w-4 rounded-tr-md" />
                    <div className="w-4 h-px bg-gray-200" />
                    <div className="flex-1 border-r border-b border-gray-200 w-4 rounded-br-md" />
                  </div>
                </div>

                {/* Consolação SF */}
                <div className="flex flex-col gap-8 justify-around py-16">
                  <BracketMatch isPlaceholder />
                  <BracketMatch isPlaceholder />
                </div>

                <div className="flex flex-col justify-around py-16">
                  <div className="flex flex-col items-start" style={{ height: "100%" }}>
                    <div className="flex-1 border-r border-t border-gray-200 w-4 rounded-tr-md" />
                    <div className="w-4 h-px bg-gray-200" />
                    <div className="flex-1 border-r border-b border-gray-200 w-4 rounded-br-md" />
                  </div>
                </div>

                {/* Consolação Final */}
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-2">
                    <BracketMatch isPlaceholder />
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider mt-1">
                      3º Lugar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
