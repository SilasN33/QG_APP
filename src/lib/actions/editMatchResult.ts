"use server";

import { createClient } from "@/lib/supabase/server";

export interface EditMatchResultInput {
  match_id: string;
  winner_id: string;
  sets: { set_number: number; player1_games: number; player2_games: number }[];
  is_wo: boolean;
}

export async function editMatchResultAction(
  input: EditMatchResultInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { data: me } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!me) return { error: "Jogador não encontrado." };

  const { data: match } = await supabase
    .from("matches")
    .select("id, player1_id, player2_id, status")
    .eq("id", input.match_id)
    .single();

  if (!match) return { error: "Partida não encontrada." };

  const isParticipant = match.player1_id === me.id || match.player2_id === me.id;
  if (!isParticipant) {
    return { error: "Você não tem permissão para editar o resultado desta partida." };
  }

  if (match.status !== "completed" && match.status !== "wo") {
    return { error: "Só é possível editar partidas já encerradas." };
  }

  // Delete existing sets
  const { error: deleteError } = await supabase
    .from("match_sets")
    .delete()
    .eq("match_id", input.match_id);

  if (deleteError) return { error: deleteError.message };

  // Update match
  const { error: matchError } = await supabase
    .from("matches")
    .update({
      winner_id: input.winner_id,
      status: input.is_wo ? "wo" : "completed",
    })
    .eq("id", input.match_id);

  if (matchError) return { error: matchError.message };

  // Insert new sets
  if (!input.is_wo && input.sets.length > 0) {
    const { error: setsError } = await supabase
      .from("match_sets")
      .insert(input.sets.map((s) => ({ ...s, match_id: input.match_id })));
    if (setsError) return { error: setsError.message };
  }

  return { error: null };
}
