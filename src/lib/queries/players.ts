import { createClient } from "@/lib/supabase/server";
import type { Player, GroupLetter } from "@/types";

export async function getPlayerByUserId(userId: string): Promise<Player | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data as Player | null;
}

export async function getAllPlayers(): Promise<Player[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .order("group_letter")
    .order("name");
  return (data ?? []) as Player[];
}

export async function getUnclaimedPlayers(): Promise<Player[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .is("user_id", null)
    .order("group_letter")
    .order("name");
  return (data ?? []) as Player[];
}

export async function claimPlayerProfile(
  playerId: string,
  userId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Ensure player is not already claimed
  const { data: existing } = await supabase
    .from("players")
    .select("user_id")
    .eq("id", playerId)
    .single();

  if (existing?.user_id) {
    return { error: "Este jogador já está vinculado a outra conta." };
  }

  const { error } = await supabase
    .from("players")
    .update({ user_id: userId })
    .eq("id", playerId);

  return { error: error?.message ?? null };
}

export async function getPlayersByGroup(group: GroupLetter): Promise<Player[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("players")
    .select("*")
    .eq("group_letter", group)
    .order("name");
  return (data ?? []) as Player[];
}
