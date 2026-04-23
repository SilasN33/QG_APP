import { getAllPlayers } from "@/lib/queries/players";
import { getAllMatches } from "@/lib/queries/matches";
import { computeAllStandings } from "@/lib/queries/standings";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/utils/cn";
import Link from "next/link";
import type { Standing, GroupLetter } from "@/types";

const GROUPS: GroupLetter[] = ["A", "B", "C", "D"];

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  let allStandings: Standing[] = [];

  try {
    const [players, matches] = await Promise.all([
      getAllPlayers(),
      getAllMatches(),
    ]);
    allStandings = computeAllStandings(players, matches);
  } catch {
    // Supabase unavailable — render empty state gracefully
  }

  const groupedStandings = GROUPS.map((g) => ({
    letter: g,
    standings: allStandings
      .filter((s) => s.group_letter === g)
      .sort((a, b) => a.position - b.position),
  }));

  const totalPlayers = allStandings.length;
  const completedMatches = Math.round(
    allStandings.reduce((acc, s) => acc + s.matches_played, 0) / 2
  );

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
            <h1 className="font-display font-bold text-white leading-none tracking-tight" style={{ fontSize: "clamp(3rem, 16vw, 5rem)" }}>
              QG OPEN
            </h1>
            <p className="font-display font-bold text-lime-500 leading-none mt-1 lime-glow" style={{ fontSize: "clamp(2rem, 12vw, 3.5rem)" }}>
              2026
            </p>
          </div>

          <p
            className="text-white/30 text-[10px] font-semibold tracking-[0.28em] uppercase mt-4 animate-slide-up"
            style={{ animationDelay: "0.12s" }}
          >
            Compita · Supere · Seja Lendário
          </p>

          {/* Stats bar */}
          {totalPlayers > 0 && (
            <div
              className="flex items-center justify-center gap-6 mt-8 animate-slide-up"
              style={{ animationDelay: "0.17s" }}
            >
              <StatPill label="Jogadores" value={totalPlayers} accent />
              <div className="w-px h-8 bg-white/10" />
              <StatPill label="Grupos" value={GROUPS.length} />
              <div className="w-px h-8 bg-white/10" />
              <StatPill label="Partidas" value={completedMatches || "—"} />
            </div>
          )}

          {/* CTA buttons */}
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
            <Link
              href="/signup"
              className="block w-full bg-surface-0/40 border border-white/[0.08] text-white/55 font-semibold text-sm py-3.5 rounded-2xl hover:text-white/80 hover:bg-surface-0/60 transition-all text-center"
            >
              Criar conta
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
          {groupedStandings.map(({ letter, standings }, idx) => (
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
          <div className="py-9 text-center text-white/15 text-sm font-medium">
            Em breve...
          </div>
        ) : (
          standings.map((s, i) => {
            const classified = i < 2;
            return (
              <div
                key={s.player.id}
                className={cn("flex items-center gap-3 px-4 py-3", classified && "bg-lime-500/[0.03]")}
              >
                {/* Position */}
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

                {/* Avatar */}
                <Avatar
                  name={s.player.name}
                  src={s.player.avatar_url}
                  size="md"
                  className={cn(!classified && "opacity-40")}
                />

                {/* Name + matches */}
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

                {/* Stats */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={cn(
                      "font-display font-bold text-sm w-5 text-center",
                      classified ? "text-white/80" : "text-white/25"
                    )}
                  >
                    {s.points}
                  </span>
                  <span className="text-lime-500/70 font-bold text-xs w-5 text-center">
                    {s.wins}
                  </span>
                  <span className="text-red-400/40 text-xs w-5 text-center">
                    {s.losses}
                  </span>
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
