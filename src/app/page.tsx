"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeAllStandings } from "@/lib/queries/standings";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import Link from "next/link";
import type { Player, Match, Standing, GroupLetter } from "@/types";

const GROUPS: GroupLetter[] = ["A", "B", "C", "D"];

type GroupedStanding = { letter: GroupLetter; standings: Standing[] };

const EMPTY_GROUPS: GroupedStanding[] = GROUPS.map((g) => ({ letter: g, standings: [] }));

// 27 abr 2026 às 00:00 BRT (UTC-3)
const TOURNAMENT_START = new Date("2026-04-27T03:00:00Z");

type Countdown = { d: number; h: number; m: number; s: number };

function useCountdown(): { countdown: Countdown | null; started: boolean } {
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [started, setStarted]     = useState(false);

  useEffect(() => {
    function tick() {
      const diff = TOURNAMENT_START.getTime() - Date.now();
      if (diff <= 0) { setStarted(true); setCountdown(null); return; }
      setCountdown({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000)  / 60_000),
        s: Math.floor((diff % 60_000)     / 1_000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return { countdown, started };
}

export default function LandingPage() {
  const [grouped, setGrouped]               = useState<GroupedStanding[]>(EMPTY_GROUPS);
  const [totalPlayers, setTotalPlayers]     = useState(0);
  const [completedMatches, setCompleted]    = useState<number | null>(null);
  const { countdown, started }              = useCountdown();

  useEffect(() => {
    async function load() {
      try {
        const supabase = createClient();

        const [{ data: pd }, { data: md }] = await Promise.all([
          supabase
            .from("players")
            .select("id, name, avatar_url, group_letter, user_id, is_admin, created_at")
            .order("group_letter")
            .order("name"),
          supabase
            .from("matches")
            .select(
              "id, player1_id, player2_id, group_letter, phase, round, scheduled_at, status, winner_id, court, created_at, match_sets(*)"
            )
            .order("scheduled_at", { ascending: true, nullsFirst: false }),
        ]);

        const players = (pd ?? []) as Player[];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matches = ((md ?? []) as any[]).map((m) => ({
          ...m,
          sets: m.match_sets ?? [],
        })) as Match[];

        const allStandings = computeAllStandings(players, matches);

        setTotalPlayers(players.filter((p) => p.group_letter !== null).length);
        setCompleted(
          Math.round(allStandings.reduce((a, s) => a + s.matches_played, 0) / 2)
        );
        setGrouped(
          GROUPS.map((g) => ({
            letter: g,
            standings: allStandings
              .filter((s) => s.group_letter === g)
              .sort((a, b) => a.position - b.position),
          }))
        );
      } catch {
        // Supabase indisponível — mantém grupos vazios
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-surface-1">
      {/* ─── Hero ─── */}
      <div className="relative bg-green-900 overflow-hidden">
        {/* Court grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg,  transparent, transparent 59px, rgba(201,241,53,0.04) 59px, rgba(201,241,53,0.04) 60px),
              repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(201,241,53,0.04) 59px, rgba(201,241,53,0.04) 60px)
            `,
          }}
        />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_55%_at_50%_-5%,rgba(39,128,79,0.25),transparent)]" />

        <div className="relative z-10 px-5 pt-14 pb-12 text-center">
          {/* Logo badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime-500 shadow-glow mb-6 animate-slide-up">
            <span className="font-display font-bold text-surface-0 text-2xl tracking-tight">QG</span>
          </div>

          {/* Title */}
          <div className="animate-slide-up" style={{ animationDelay: "0.06s" }}>
            <h1
              className="font-display font-bold text-white leading-none tracking-tight"
              style={{ fontSize: "clamp(3rem, 16vw, 5rem)" }}
            >
              QG OPEN
            </h1>
            <p
              className="font-display font-bold text-lime-500 leading-none mt-1 lime-glow"
              style={{ fontSize: "clamp(2rem, 12vw, 3.5rem)" }}
            >
              2026
            </p>
          </div>

          <p
            className="text-white/30 text-[10px] font-semibold tracking-[0.28em] uppercase mt-4 animate-slide-up"
            style={{ animationDelay: "0.12s" }}
          >
            Compita · Supere · Seja Lendário
          </p>

          {/* ── Countdown ── */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: "0.16s" }}>
            {started ? (
              <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/30 rounded-2xl px-5 py-2.5">
                <span className="w-2 h-2 rounded-full bg-lime-500 shadow-glow inline-block animate-pulse" />
                <span className="font-display font-bold text-lime-400 text-sm tracking-wide">
                  Torneio em andamento
                </span>
              </div>
            ) : (
              <div>
                <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.28em] mb-3">
                  Começa em
                </p>
                <div className="inline-flex items-center gap-1">
                  {countdown ? (
                    <>
                      <CountUnit value={countdown.d} label="dias" />
                      <Colon />
                      <CountUnit value={countdown.h} label="hrs" />
                      <Colon />
                      <CountUnit value={countdown.m} label="min" />
                      <Colon />
                      <CountUnit value={countdown.s} label="seg" highlight />
                    </>
                  ) : (
                    /* placeholder antes do primeiro tick */
                    [["—","dias"],["—","hrs"],["—","min"],["—","seg"]].map(([v, l], i) => (
                      <span key={i} className="flex items-center gap-1">
                        {i > 0 && <Colon />}
                        <CountUnit value={v} label={l} />
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats bar — only shown once data loads */}
          {totalPlayers > 0 && (
            <div
              className="flex items-center justify-center gap-6 mt-8 animate-slide-up"
              style={{ animationDelay: "0.17s" }}
            >
              <StatPill label="Jogadores" value={totalPlayers} accent />
              <div className="w-px h-8 bg-white/10" />
              <StatPill label="Grupos" value={GROUPS.length} />
              <div className="w-px h-8 bg-white/10" />
              <StatPill label="Partidas" value={completedMatches ?? "—"} />
            </div>
          )}

          {/* CTA button */}
          <div
            className="flex flex-col gap-3 mt-10 max-w-xs mx-auto animate-slide-up"
            style={{ animationDelay: "0.22s" }}
          >
            <Link
              href="/login"
              className="block w-full bg-lime-500 text-surface-0 font-display font-bold text-base py-4 rounded-2xl shadow-glow hover:bg-lime-400 transition-colors active:scale-[0.98] text-center"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Groups Dashboard ─── */}
      <div className="px-4 pt-7 pb-14">
        <p className="text-white/25 text-[9px] font-bold uppercase tracking-[0.28em] mb-4 px-1">
          Grupos do Torneio
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {grouped.map(({ letter, standings }, idx) => (
            <GroupCard
              key={letter}
              letter={letter}
              standings={standings}
              delay={0.27 + idx * 0.07}
            />
          ))}
        </div>
      </div>

      {/* ─── Footer CTA ─── */}
      <div className="relative bg-green-950 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_80%_at_50%_100%,rgba(201,241,53,0.04),transparent)]" />
        <div className="relative z-10 px-5 py-10 text-center">
          <p className="font-display font-bold text-white/60 text-sm mb-1">
            Já faz parte do torneio?
          </p>
          <p className="text-white/30 text-xs mb-6">
            Entre com sua conta para acompanhar seus jogos e resultados.
          </p>
          <Link
            href="/login"
            className="inline-block bg-lime-500/10 border border-lime-500/30 text-lime-400 font-display font-bold text-sm px-8 py-3 rounded-xl hover:bg-lime-500/20 hover:border-lime-500/50 transition-all"
          >
            Entrar agora
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function CountUnit({ value, label, highlight }: { value: number | string; label: string; highlight?: boolean }) {
  const display = typeof value === "number" ? String(value).padStart(2, "0") : value;
  return (
    <div className="flex flex-col items-center bg-surface-0/50 border border-white/[0.07] rounded-xl px-3 py-2 min-w-[56px]">
      <span
        className={cn(
          "font-display font-bold text-2xl leading-none tabular-nums",
          highlight ? "text-lime-500 lime-glow" : "text-white"
        )}
      >
        {display}
      </span>
      <span className="text-white/25 text-[9px] uppercase tracking-widest font-semibold mt-1">{label}</span>
    </div>
  );
}

function Colon() {
  return <span className="font-display font-bold text-white/20 text-xl mb-3 select-none">:</span>;
}

function StatPill({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn("font-display font-bold text-2xl leading-none", accent ? "text-lime-500 lime-glow" : "text-white")}>
        {value}
      </p>
      <p className="text-white/25 text-[9px] uppercase tracking-widest font-semibold mt-1">{label}</p>
    </div>
  );
}

function GroupCard({
  letter,
  standings,
  delay,
}: {
  letter: GroupLetter;
  standings: Standing[];
  delay: number;
}) {
  return (
    <div
      className="bg-surface-2 rounded-2xl border border-white/[0.06] shadow-card overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-lime-500/15 border border-lime-500/25 flex items-center justify-center">
            <span className="font-display font-bold text-lime-400 text-sm leading-none">{letter}</span>
          </div>
          <span className="font-display font-bold text-white/55 text-sm tracking-wide">
            Grupo {letter}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-widest text-white/20 pr-1">
          <span>PTS</span>
          <span className="w-5 text-center">V</span>
          <span className="w-5 text-center">D</span>
        </div>
      </div>

      {/* Player rows */}
      <div className="divide-y divide-white/[0.03]">
        {standings.length === 0 ? (
          /* Skeleton rows while loading */
          [1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-3 px-4 py-3">
              <div className="w-5 h-5 rounded-full bg-surface-3 shrink-0 animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-surface-3 shrink-0 animate-pulse" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-surface-3 rounded-full w-3/4 animate-pulse" />
                <div className="h-2 bg-surface-3 rounded-full w-1/3 animate-pulse" />
              </div>
              <div className="flex gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-5 h-3 bg-surface-3 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))
        ) : (
          standings.map((s, i) => {
            const classified = i < 2;
            return (
              <div
                key={s.player.id}
                className={cn("flex items-center gap-3 px-4 py-3", classified && "bg-lime-500/[0.03]")}
              >
                <span
                  className={cn(
                    "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-display font-bold shrink-0",
                    classified
                      ? "bg-lime-500/20 text-lime-400 border border-lime-500/30"
                      : "bg-surface-3 text-white/20"
                  )}
                >
                  {s.position}
                </span>

                <Avatar
                  name={s.player.name}
                  src={s.player.avatar_url}
                  size="md"
                  className={cn(!classified && "opacity-40")}
                />

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold truncate leading-tight",
                      classified ? "text-white/85" : "text-white/30"
                    )}
                  >
                    {s.player.name}
                  </p>
                  <p className="text-[10px] text-white/20 leading-tight mt-0.5">
                    {s.matches_played} {s.matches_played === 1 ? "jogo" : "jogos"}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={cn("font-display font-bold text-sm w-5 text-center", classified ? "text-white/80" : "text-white/25")}>
                    {s.points}
                  </span>
                  <span className="text-lime-500/70 font-bold text-xs w-5 text-center">{s.wins}</span>
                  <span className="text-red-400/40 text-xs w-5 text-center">{s.losses}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-white/[0.04]">
        <span className="w-2 h-2 rounded-full bg-lime-500/60 inline-block" />
        <span className="text-[9px] text-white/20 font-medium">Classificado às oitavas</span>
      </div>
    </div>
  );
}
