import { createClient } from "@/lib/supabase/server";
import type { Match, GroupLetter } from "@/types";

// Shape returned by Supabase join query
type RawMatch = {
  id: string;
  player1_id: string;
  player2_id: string;
  group_letter: string | null;
  phase: string;
  round: number;
  scheduled_at: string | null;
  status: string;
  winner_id: string | null;
  court: string | null;
  created_at: string;
  player1: { id: string; name: string; avatar_url: string | null; group_letter: string; user_id: string | null; created_at: string } | null;
  player2: { id: string; name: string; avatar_url: string | null; group_letter: string; user_id: string | null; created_at: string } | null;
  match_sets: { id: string; match_id: string; set_number: number; player1_games: number; player2_games: number }[];
};

function toMatch(raw: RawMatch): Match {
  return {
    ...raw,
    group_letter: raw.group_letter as GroupLetter | null,
    phase: raw.phase as Match["phase"],
    status: raw.status as Match["status"],
    player1: raw.player1 ? { ...raw.player1, group_letter: raw.player1.group_letter as GroupLetter } : undefined,
    player2: raw.player2 ? { ...raw.player2, group_letter: raw.player2.group_letter as GroupLetter } : undefined,
    sets: raw.match_sets ?? [],
  };
}

const PLAYER_SELECT = "id, name, avatar_url, group_letter, user_id, created_at";
const MATCH_SELECT = `*, player1:players!matches_player1_id_fkey(${PLAYER_SELECT}), player2:players!matches_player2_id_fkey(${PLAYER_SELECT}), match_sets(*)`;

export async function getAllMatches(): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  return ((data ?? []) as RawMatch[]).map(toMatch);
}

export async function getMatchesByGroup(group: GroupLetter): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .eq("group_letter", group)
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  return ((data ?? []) as RawMatch[]).map(toMatch);
}

export async function getMatchesByPlayer(playerId: string): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .or(`player1_id.eq.${playerId},player2_id.eq.${playerId}`)
    .order("scheduled_at", { ascending: false, nullsFirst: false });
  return ((data ?? []) as RawMatch[]).map(toMatch);
}

export async function getBracketMatches(): Promise<Match[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("matches")
    .select(MATCH_SELECT)
    .in("phase", [
      "quarterfinals",
      "semifinals",
      "final",
      "consolation_quarterfinals",
      "consolation_semifinals",
      "consolation_final",
    ])
    .order("phase")
    .order("scheduled_at", { ascending: true, nullsFirst: false });
  return ((data ?? []) as RawMatch[]).map(toMatch);
}

export async function submitMatchResult(
  matchId: string,
  winnerId: string,
  sets: { set_number: number; player1_games: number; player2_games: number }[],
  isWo: boolean
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error: matchError } = await supabase
    .from("matches")
    .update({
      winner_id: winnerId,
      status: isWo ? "wo" : "completed",
    })
    .eq("id", matchId);

  if (matchError) return { error: matchError.message };

  if (!isWo && sets.length > 0) {
    const { error: setsError } = await supabase
      .from("match_sets")
      .insert(sets.map((s) => ({ ...s, match_id: matchId })));
    if (setsError) return { error: setsError.message };
  }

  return { error: null };
}
