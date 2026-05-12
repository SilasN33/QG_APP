"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  match_id: z.string().uuid("ID da partida inválido."),
});

export async function deleteMatchAction(
  matchId: string
): Promise<{ error: string | null }> {
  const parsed = schema.safeParse({ match_id: matchId });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { data: me } = await supabase
    .from("players")
    .select("id, is_admin")
    .eq("user_id", user.id)
    .single();

  if (!me) return { error: "Jogador não encontrado." };

  const { data: match } = await supabase
    .from("matches")
    .select("id, player1_id, player2_id, status")
    .eq("id", parsed.data.match_id)
    .single();

  if (!match) return { error: "Partida não encontrada." };

  const isParticipant = match.player1_id === me.id || match.player2_id === me.id;
  if (!isParticipant && !me.is_admin) {
    return { error: "Você não tem permissão para excluir esta partida." };
  }
  if (match.status === "completed" || match.status === "wo") {
    return { error: "Não é possível excluir uma partida já encerrada." };
  }

  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", parsed.data.match_id);

  if (error) return { error: error.message };
  return { error: null };
}
