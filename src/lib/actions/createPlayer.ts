"use server";

import { createClient } from "@/lib/supabase/server";

export async function createPlayerAction(name: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Sessão expirada. Faça login novamente." };

  const { error } = await supabase
    .from("players")
    .insert({ name: name.trim(), user_id: user.id });

  if (error) {
    // Perfil já existe (unique constraint)
    if (error.code === "23505") return { error: null };
    return { error: error.message };
  }

  return { error: null };
}
