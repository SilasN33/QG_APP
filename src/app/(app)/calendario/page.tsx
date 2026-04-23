import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllMatches } from "@/lib/queries/matches";
import { getAllPlayers, getPlayerByUserId } from "@/lib/queries/players";
import { CalendarioClient } from "./CalendarioClient";

export default async function CalendarioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [allMatches, allPlayers, currentPlayer] = await Promise.all([
    getAllMatches(),
    getAllPlayers(),
    getPlayerByUserId(user.id),
  ]);

  return (
    <CalendarioClient
      allMatches={allMatches}
      allPlayers={allPlayers}
      currentPlayer={currentPlayer}
    />
  );
}
