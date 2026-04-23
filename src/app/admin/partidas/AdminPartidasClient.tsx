"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createMatchAction } from "@/lib/actions/createMatch";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import type { Match, Player, GroupLetter, MatchPhase } from "@/types";
import {
  Loader2, Trash2, RefreshCw, AlertTriangle,
  Plus, ChevronDown, ChevronUp, CalendarDays, X,
} from "lucide-react";

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

const PHASE_LABELS: Record<MatchPhase, string> = {
  group: "Fase de Grupos",
  quarterfinals: "Quartas de Final",
  semifinals: "Semifinal",
  final: "Final",
  consolation_quarterfinals: "Quartas (Consolação)",
  consolation_semifinals: "Semi (Consolação)",
  consolation_final: "Final (Consolação)",
};

interface Props {
  players: Player[];
  matches: Match[];
}

// ─── Create Match Form ────────────────────────────────────────────────────────
function CreateMatchForm({
  players,
  onCreated,
}: {
  players: Player[];
  onCreated: (match: Match) => void;
}) {
  const [p1, setP1] = useState<string>("");
  const [p2, setP2] = useState<string>("");
  const [group, setGroup] = useState<GroupLetter | "">("");
  const [phase, setPhase] = useState<MatchPhase>("group");
  const [date, setDate] = useState("");      // date portion  yyyy-mm-dd
  const [time, setTime] = useState("");      // time portion  HH:mm
  const [court, setCourt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!p1 || !p2) { setError("Selecione os dois jogadores."); return; }
    if (p1 === p2) { setError("Os jogadores devem ser diferentes."); return; }

    setSaving(true);
    setError(null);

    // Build ISO datetime
    let scheduled_at: string | null = null;
    if (date) {
      scheduled_at = time ? `${date}T${time}:00` : `${date}T00:00:00`;
    }

    const { error: actionError, matchId } = await createMatchAction({
      player1_id: p1,
      player2_id: p2,
      group_letter: (group as GroupLetter) || null,
      phase,
      scheduled_at,
      court: court.trim() || null,
    });

    if (actionError || !matchId) {
      setError(actionError ?? "Erro desconhecido.");
      setSaving(false);
      return;
    }

    // Fetch the created match with players
    const supabase = createClient();
    const { data } = await supabase
      .from("matches")
      .select("*, player1:players!matches_player1_id_fkey(*), player2:players!matches_player2_id_fkey(*), match_sets(*)")
      .eq("id", matchId)
      .single();

    if (data) {
      onCreated({ ...(data as unknown as Match), sets: (data as unknown as { match_sets: Match["sets"] }).match_sets ?? [] });
    }

    // Reset form
    setP1(""); setP2(""); setGroup(""); setDate(""); setTime(""); setCourt("");
    setSaving(false);
  }

  const select =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-green-700 transition-colors";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
        Criar Partida Manualmente
      </p>

      {/* Players */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Jogador 1</label>
          <select value={p1} onChange={(e) => setP1(e.target.value)} className={select}>
            <option value="">Selecionar...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === p2}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Jogador 2</label>
          <select value={p2} onChange={(e) => setP2(e.target.value)} className={select}>
            <option value="">Selecionar...</option>
            {players.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === p1}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phase + Group */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Fase</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value as MatchPhase)} className={select}>
            {(Object.entries(PHASE_LABELS) as [MatchPhase, string][]).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Grupo</label>
          <select value={group} onChange={(e) => setGroup(e.target.value as GroupLetter | "")} className={select}>
            <option value="">Nenhum</option>
            {(["A", "B", "C", "D"] as GroupLetter[]).map((g) => (
              <option key={g} value={g}>Grupo {g}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date + Time */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 font-semibold uppercase flex items-center gap-1">
            <CalendarDays size={10} /> Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={select}
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Horário</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={select}
          />
        </div>
      </div>

      {/* Court */}
      <div>
        <label className="text-[10px] text-gray-400 font-semibold uppercase">Quadra</label>
        <input
          type="text"
          value={court}
          onChange={(e) => setCourt(e.target.value)}
          placeholder="Ex: Quadra 1"
          className={select}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-clay-50 border border-clay-200 rounded-xl p-3">
          <AlertTriangle size={14} className="text-clay-500 shrink-0 mt-0.5" />
          <p className="text-xs text-clay-600">{error}</p>
        </div>
      )}

      <Button
        fullWidth
        size="sm"
        onClick={handleCreate}
        disabled={saving || !p1 || !p2}
      >
        {saving ? (
          <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Criando...</span>
        ) : (
          <span className="flex items-center gap-2"><Plus size={14} /> Criar Partida</span>
        )}
      </Button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminPartidasClient({ players, matches: initialMatches }: Props) {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

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
      if (groupMatches(g).length > 0) continue;
      for (let i = 0; i < gPlayers.length; i++) {
        for (let j = i + 1; j < gPlayers.length; j++) {
          toInsert.push({ player1_id: gPlayers[i].id, player2_id: gPlayers[j].id, group_letter: g, phase: "group", round: 1 });
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
      .select("*, player1:players!matches_player1_id_fkey(*), player2:players!matches_player2_id_fkey(*), match_sets(*)");

    if (insertError) {
      setError("Erro ao gerar partidas. Tente novamente.");
    } else {
      const newMatches = (data ?? []).map((m) => ({ ...m, sets: (m as unknown as { match_sets: Match["sets"] }).match_sets ?? [] })) as Match[];
      setMatches((prev) => [...prev, ...newMatches]);
    }

    setGenerating(false);
    startTransition(() => router.refresh());
  }

  async function deleteAllGroupMatches() {
    setDeleting(true);
    setError(null);
    const supabase = createClient();
    const ids = matches.filter((m) => m.phase === "group").map((m) => m.id);
    if (ids.length > 0) await supabase.from("matches").delete().in("id", ids);
    setMatches((prev) => prev.filter((m) => m.phase !== "group"));
    setDeleting(false);
    setConfirmDelete(false);
    startTransition(() => router.refresh());
  }

  async function updateMatchStatus(matchId: string, status: string) {
    const supabase = createClient();
    await supabase.from("matches").update({ status }).eq("id", matchId);
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: status as Match["status"] } : m)));
    startTransition(() => router.refresh());
  }

  async function updateMatchDate(matchId: string, scheduled_at: string | null) {
    const supabase = createClient();
    await supabase.from("matches").update({ scheduled_at }).eq("id", matchId);
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, scheduled_at } : m)));
    startTransition(() => router.refresh());
  }

  function handleMatchCreated(match: Match) {
    setMatches((prev) => [...prev, match]);
    setShowCreateForm(false);
    startTransition(() => router.refresh());
  }

  const hasGroupMatches = matches.some((m) => m.phase === "group");

  return (
    <div className="px-4 py-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">Partidas</h2>
          <p className="text-xs text-gray-500 mt-0.5">Gere ou crie partidas manualmente.</p>
        </div>
        <button
          onClick={() => setShowCreateForm((v) => !v)}
          className="flex items-center gap-1.5 bg-green-900 text-green-100 text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-800 transition-colors"
        >
          {showCreateForm ? <ChevronUp size={14} /> : <Plus size={14} />}
          {showCreateForm ? "Fechar" : "Nova Partida"}
        </button>
      </div>

      {/* Create match form */}
      {showCreateForm && (
        <CreateMatchForm players={players} onCreated={handleMatchCreated} />
      )}

      {/* Auto-generation */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fase de Grupos — Geração Automática</p>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span>{readyGroups.length} grupo(s) com jogadores</span>
          {readyGroups.map((g) => (
            <span key={g} className={cn("px-1.5 py-0.5 rounded font-bold text-[10px]", GROUP_COLORS[g])}>{g}</span>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-clay-50 border border-clay-200 rounded-xl p-3">
            <AlertTriangle size={14} className="text-clay-500 shrink-0 mt-0.5" />
            <p className="text-xs text-clay-600">{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button fullWidth size="sm" onClick={generateGroupMatches} disabled={generating || readyGroups.length === 0}>
            {generating ? (
              <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Gerando...</span>
            ) : (
              <span className="flex items-center gap-2"><RefreshCw size={14} /> Gerar Partidas de Grupo</span>
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
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)} className="flex-1 text-gray-500">Cancelar</Button>
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
              <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", GROUP_COLORS[g])}>GRUPO {g}</span>
              <span className="text-[10px] text-gray-400">{gMatches.length} partidas</span>
            </div>
            <div className="space-y-2">
              {gMatches.map((match) => (
                <MatchRow key={match.id} match={match} onStatusChange={updateMatchStatus} onDateChange={updateMatchDate} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Other phases (manual matches without group) */}
      {(() => {
        const others = matches.filter((m) => m.phase !== "group" || !m.group_letter);
        if (others.length === 0) return null;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">OUTRAS FASES</span>
              <span className="text-[10px] text-gray-400">{others.length} partidas</span>
            </div>
            <div className="space-y-2">
              {others.map((match) => (
                <MatchRow key={match.id} match={match} onStatusChange={updateMatchStatus} onDateChange={updateMatchDate} />
              ))}
            </div>
          </div>
        );
      })()}

      {matches.length === 0 && (
        <p className="text-center text-gray-400 py-8 text-sm">Nenhuma partida criada ainda.</p>
      )}
    </div>
  );
}

// ─── Match Row ────────────────────────────────────────────────────────────────
function MatchRow({
  match,
  onStatusChange,
  onDateChange,
}: {
  match: Match;
  onStatusChange: (id: string, status: string) => void;
  onDateChange: (id: string, date: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [editDate, setEditDate] = useState(false);
  const [dateVal, setDateVal] = useState(match.scheduled_at ? match.scheduled_at.slice(0, 10) : "");
  const [timeVal, setTimeVal] = useState(match.scheduled_at ? match.scheduled_at.slice(11, 16) : "");

  function saveDate() {
    const newDate = dateVal ? (timeVal ? `${dateVal}T${timeVal}:00` : `${dateVal}T00:00:00`) : null;
    onDateChange(match.id, newDate);
    setEditDate(false);
  }

  function formatDate(iso: string | null) {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 p-3">
        <Avatar name={match.player1?.name ?? "?"} size="xs" />
        <span className="text-xs font-semibold text-gray-700 truncate">{match.player1?.name?.split(" ")[0]}</span>
        <span className="text-gray-300 text-xs font-black flex-1 text-center">VS</span>
        <span className="text-xs font-semibold text-gray-700 truncate">{match.player2?.name?.split(" ")[0]}</span>
        <Avatar name={match.player2?.name ?? "?"} size="xs" />
        <span className={cn("ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0", STATUS_COLORS[match.status])}>
          {STATUS_LABELS[match.status]}
        </span>
        {open ? <ChevronUp size={14} className="text-gray-400 shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-3 py-3 space-y-3">
          {/* Date info + edit */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <CalendarDays size={10} /> Data Agendada
            </p>
            {editDate ? (
              <div className="flex gap-2 items-center">
                <input type="date" value={dateVal} onChange={(e) => setDateVal(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-green-700" />
                <input type="time" value={timeVal} onChange={(e) => setTimeVal(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-2 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-green-700" />
                <button onClick={saveDate} className="w-7 h-7 rounded-full bg-green-900 text-white flex items-center justify-center text-xs font-bold hover:bg-green-800">✓</button>
                <button onClick={() => setEditDate(false)} className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200">
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button onClick={() => setEditDate(true)}
                className="text-xs text-gray-600 flex items-center gap-2 hover:text-green-800 transition-colors">
                {match.scheduled_at ? formatDate(match.scheduled_at) : <span className="text-gray-400 italic">Sem data definida</span>}
                <span className="text-[10px] text-clay-500 font-bold underline underline-offset-2">editar</span>
              </button>
            )}
          </div>

          {/* Court */}
          {match.court && (
            <p className="text-xs text-gray-500">📍 {match.court}</p>
          )}

          {/* Status buttons */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Alterar Status</p>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(STATUS_LABELS).map(([s, label]) => (
                <button key={s} onClick={() => { onStatusChange(match.id, s); setOpen(false); }}
                  className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-lg border transition-all",
                    match.status === s ? "border-gray-400 bg-gray-100 text-gray-700" : "border-gray-200 text-gray-400 hover:border-gray-300"
                  )}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
