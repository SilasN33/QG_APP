"use server";

import { createClient } from "@/lib/supabase/server";
import type { GroupLetter, MatchPhase } from "@/types";

export interface CreateMatchInput {
  player1_id: string;
  player2_id: string;
  group_letter?: GroupLetter | null;
  phase?: MatchPhase;
  round?: number;
  scheduled_at?: string | null; // ISO datetime string
  court?: string | null;
}

export async function createMatchAction(
  input: CreateMatchInput
): Promise<{ error: string | null; matchId: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente.", matchId: null };

  // Only admins can create matches
  const { data: player } = await supabase
    .from("players")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!player?.is_admin) {
    return { error: "Apenas administradores podem criar partidas.", matchId: null };
  }

  if (input.player1_id === input.player2_id) {
    return { error: "Os dois jogadores devem ser diferentes.", matchId: null };
  }

  const { data, error } = await supabase
    .from("matches")
    .insert({
      player1_id: input.player1_id,
      player2_id: input.player2_id,
      group_letter: input.group_letter ?? null,
      phase: input.phase ?? "group",
      round: input.round ?? 1,
      scheduled_at: input.scheduled_at ?? null,
      court: input.court ?? null,
      status: "scheduled",
    })
    .select("id")
    .single();

  if (error) return { error: error.message, matchId: null };
  return { error: null, matchId: data.id };
}
