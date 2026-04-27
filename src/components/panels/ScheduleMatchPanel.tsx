"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Calendar, Clock, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { scheduleMatchAction } from "@/lib/actions/scheduleMatch";
import { useCurrentPlayer } from "@/lib/hooks/useCurrentPlayer";
import type { Player } from "@/types";

type Step = 1 | 2 | 3;

interface Props {
  onClose: () => void;
}

export function ScheduleMatchPanel({ onClose }: Props) {
  const currentPlayer = useCurrentPlayer();

  const [step, setStep] = useState<Step>(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [opponent, setOpponent] = useState<Player | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [court, setCourt] = useState("");

  useEffect(() => {
    async function fetchPlayers() {
      const supabase = createClient();
      const query = supabase
        .from("players")
        .select("*")
        .order("group_letter")
        .order("name");

      if (currentPlayer?.id) {
        query.neq("id", currentPlayer.id);
      }

      const { data } = await query;
      setPlayers((data ?? []) as Player[]);
      setLoadingPlayers(false);
    }
    fetchPlayers();
  }, [currentPlayer?.id]);

  async function handleConfirm() {
    if (!opponent || !date || !time) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = await scheduleMatchAction({
      opponent_id: opponent.id,
      scheduled_at: new Date(`${date}T${time}`).toISOString(),
      court: court.trim() || null,
    });

    setSubmitting(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      setTimeout(onClose, 2200);
    }
  }

  const todayISO = new Date().toISOString().split("T")[0];

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 px-6">
        <div className="w-16 h-16 rounded-full bg-lime-500/15 flex items-center justify-center animate-pulse">
          <CheckCircle2 size={32} className="text-lime-500" />
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-white text-lg">Partida agendada!</p>
          <p className="text-white/40 text-sm mt-1">
            vs {opponent?.name}
            {date && (
              <>
                {" · "}
                {format(new Date(date + "T00:00"), "d 'de' MMM", { locale: ptBR })}
                {time && ` · ${time}`}
              </>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-4 pb-10">
      {/* Progress bar */}
      <div className="flex gap-1.5 mb-6">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-300",
              s <= step ? "bg-lime-500" : "bg-surface-3"
            )}
          />
        ))}
      </div>

      {/* ── Step 1: Escolher adversário ── */}
      {step === 1 && (
        <div>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
            Escolha o adversário
          </p>

          {loadingPlayers ? (
            <div className="space-y-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-[62px] rounded-2xl bg-surface-3 animate-pulse" />
              ))}
            </div>
          ) : players.length === 0 ? (
            <p className="text-center text-white/30 text-sm py-10">
              Nenhum jogador disponível
            </p>
          ) : (
            <div className="space-y-2">
              {players.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setOpponent(p); setStep(2); }}
                  className="w-full flex items-center gap-3 bg-surface-2 hover:bg-surface-3 border border-white/[0.06] hover:border-lime-500/20 rounded-2xl px-4 py-3 transition-all text-left active:scale-[0.98]"
                >
                  <Avatar name={p.name} src={p.avatar_url} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white/90 font-semibold text-sm truncate">{p.name}</p>
                    {p.group_letter && (
                      <p className="text-white/30 text-xs">Grupo {p.group_letter}</p>
                    )}
                  </div>
                  {p.group_letter && (
                    <span className="shrink-0 font-display font-bold text-xs text-lime-500 bg-lime-500/10 px-2 py-1 rounded-lg">
                      {p.group_letter}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Data, hora e quadra ── */}
      {step === 2 && (
        <div>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-white/35 text-sm mb-5 hover:text-white/60 transition-colors"
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          {/* Opponent summary */}
          {opponent && (
            <div className="flex items-center gap-3 bg-surface-2 border border-lime-500/15 rounded-2xl px-4 py-3 mb-5">
              <Avatar name={opponent.name} src={opponent.avatar_url} size="sm" />
              <div className="min-w-0">
                <p className="text-white/35 text-[10px] uppercase tracking-wider font-bold">Adversário</p>
                <p className="text-white/90 font-semibold text-sm truncate">{opponent.name}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="flex items-center gap-1.5 text-white/35 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Calendar size={11} /> Data
              </label>
              <input
                type="date"
                value={date}
                min={todayISO}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.08] focus:border-lime-500/40 rounded-xl px-4 py-3 text-white/90 text-sm outline-none transition-colors [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-white/35 text-[10px] font-bold uppercase tracking-wider mb-2">
                <Clock size={11} /> Horário
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-surface-2 border border-white/[0.08] focus:border-lime-500/40 rounded-xl px-4 py-3 text-white/90 text-sm outline-none transition-colors [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-white/35 text-[10px] font-bold uppercase tracking-wider mb-2">
                <MapPin size={11} /> Quadra <span className="text-white/20 normal-case font-normal">(opcional)</span>
              </label>
              <input
                type="text"
                value={court}
                onChange={(e) => setCourt(e.target.value)}
                placeholder="Ex: Quadra 1"
                className="w-full bg-surface-2 border border-white/[0.08] focus:border-lime-500/40 rounded-xl px-4 py-3 text-white/90 text-sm placeholder:text-white/20 outline-none transition-colors"
              />
            </div>
          </div>

          <Button
            size="lg"
            fullWidth
            className="mt-6"
            disabled={!date || !time}
            onClick={() => setStep(3)}
          >
            Continuar
          </Button>
        </div>
      )}

      {/* ── Step 3: Confirmação ── */}
      {step === 3 && (
        <div>
          <button
            onClick={() => setStep(2)}
            className="flex items-center gap-1 text-white/35 text-sm mb-5 hover:text-white/60 transition-colors"
          >
            <ChevronLeft size={16} /> Voltar
          </button>

          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
            Confirme os detalhes
          </p>

          <div className="bg-surface-2 border border-white/[0.06] rounded-2xl p-4 mb-5 space-y-3">
            {opponent && (
              <div className="flex items-center gap-3">
                <Avatar name={opponent.name} src={opponent.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold">vs</p>
                  <p className="text-white/90 font-semibold text-sm truncate">{opponent.name}</p>
                </div>
              </div>
            )}

            <div className="border-t border-white/[0.05] pt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 mb-1">
                  <Calendar size={10} /> Data
                </p>
                <p className="text-white/80 text-sm font-semibold">
                  {date
                    ? format(new Date(date + "T00:00"), "d 'de' MMM, yyyy", { locale: ptBR })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 mb-1">
                  <Clock size={10} /> Horário
                </p>
                <p className="text-white/80 text-sm font-semibold">{time || "—"}</p>
              </div>
              {court.trim() && (
                <div className="col-span-2">
                  <p className="text-white/30 text-[10px] uppercase tracking-wider font-bold flex items-center gap-1 mb-1">
                    <MapPin size={10} /> Quadra
                  </p>
                  <p className="text-white/80 text-sm font-semibold">{court}</p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            size="lg"
            fullWidth
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Agendando…
              </>
            ) : (
              "Confirmar Agendamento"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
