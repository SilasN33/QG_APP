"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  opponent_id:  z.string().uuid("ID do adversário inválido."),
  scheduled_at: z.string().min(1, "Data obrigatória."),
  court:        z.string().max(50).nullable().optional(),
});

export type ScheduleMatchInput = z.infer<typeof schema>;

export async function scheduleMatchAction(
  input: ScheduleMatchInput
): Promise<{ error: string | null }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { opponent_id, scheduled_at, court } = parsed.data;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { data: me } = await supabase
    .from("players")
    .select("id, group_letter")
    .eq("user_id", user.id)
    .single();

  if (!me) return { error: "Jogador não encontrado." };
  if (me.id === opponent_id) return { error: "Você não pode marcar um jogo contra si mesmo." };

  const { data: opponent } = await supabase
    .from("players")
    .select("id, group_letter")
    .eq("id", opponent_id)
    .single();

  if (!opponent) return { error: "Adversário não encontrado." };

  const group_letter =
    me.group_letter && me.group_letter === opponent.group_letter
      ? me.group_letter
      : null;

  const { error } = await supabase.from("matches").insert({
    player1_id:   me.id,
    player2_id:   opponent_id,
    group_letter,
    phase:        "group",
    round:        1,
    scheduled_at,
    court:        court ?? null,
    status:       "scheduled",
  });

  if (error) return { error: error.message };
  return { error: null };
}
