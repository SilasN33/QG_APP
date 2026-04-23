"use server";

import { createClient } from "@/lib/supabase/server";

export interface ScheduleMatchInput {
  opponent_id: string;
  scheduled_at: string;
  court?: string | null;
}

export async function scheduleMatchAction(
  input: ScheduleMatchInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { data: me } = await supabase
    .from("players")
    .select("id, group_letter")
    .eq("user_id", user.id)
    .single();

  if (!me) return { error: "Jogador não encontrado." };
  if (me.id === input.opponent_id) return { error: "Você não pode marcar um jogo contra si mesmo." };

  const { data: opponent } = await supabase
    .from("players")
    .select("id, group_letter")
    .eq("id", input.opponent_id)
    .single();

  if (!opponent) return { error: "Adversário não encontrado." };

  const group_letter =
    me.group_letter && me.group_letter === opponent.group_letter
      ? me.group_letter
      : null;

  const { error } = await supabase.from("matches").insert({
    player1_id: me.id,
    player2_id: input.opponent_id,
    group_letter,
    phase: "group",
    round: 1,
    scheduled_at: input.scheduled_at,
    court: input.court ?? null,
    status: "scheduled",
  });

  if (error) return { error: error.message };
  return { error: null };
}
