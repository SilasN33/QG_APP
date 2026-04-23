"use server";

import { createClient } from "@/lib/supabase/server";
import type { GroupLetter } from "@/types";

export async function updatePlayerGroupAction(
  group_letter: GroupLetter | null
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase
    .from("players")
    .update({ group_letter })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}

export async function updatePlayerNameAction(
  name: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  if (!name.trim()) return { error: "Nome não pode ser vazio." };

  const { error } = await supabase
    .from("players")
    .update({ name: name.trim() })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { error: null };
}
