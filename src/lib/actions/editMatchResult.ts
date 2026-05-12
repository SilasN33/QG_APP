"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const setSchema = z.object({
  set_number:    z.number().int().min(1).max(3),
  player1_games: z.number().int().min(0).max(7),
  player2_games: z.number().int().min(0).max(7),
});

const schema = z.object({
  match_id:  z.string().uuid("ID da partida inválido."),
  winner_id: z.string().uuid("ID do vencedor inválido."),
  sets:      z.array(setSchema).max(3),
  is_wo:     z.boolean(),
});

export type EditMatchResultInput = z.infer<typeof schema>;

export async function editMatchResultAction(
  input: EditMatchResultInput
): Promise<{ error: string | null }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { match_id, winner_id, sets, is_wo } = parsed.data;
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
    .eq("id", match_id)
    .single();

  if (!match) return { error: "Partida não encontrada." };
  if (match.player1_id !== me.id && match.player2_id !== me.id) {
    return { error: "Você não tem permissão para editar o resultado desta partida." };
  }
  if (match.status !== "completed" && match.status !== "wo") {
    return { error: "Só é possível editar partidas já encerradas." };
  }

  const { error: deleteError } = await supabase
    .from("match_sets")
    .delete()
    .eq("match_id", match_id);

  if (deleteError) return { error: deleteError.message };

  const { error: matchError } = await supabase
    .from("matches")
    .update({ winner_id, status: is_wo ? "wo" : "completed" })
    .eq("id", match_id);

  if (matchError) return { error: matchError.message };

  if (!is_wo && sets.length > 0) {
    const { error: setsError } = await supabase
      .from("match_sets")
      .insert(sets.map((s) => ({ ...s, match_id })));
    if (setsError) return { error: setsError.message };
  }

  return { error: null };
}
