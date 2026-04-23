import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/queries/players";
import { getMatchesByPlayer } from "@/lib/queries/matches";
import { RegistrarResultadoClient } from "./RegistrarResultadoClient";

export default async function NovaPartidaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/setup");

  const myMatches = await getMatchesByPlayer(player.id);
  const pendingMatches = myMatches.filter((m) => m.status === "scheduled");

  return <RegistrarResultadoClient player={player} pendingMatches={pendingMatches} />;
}
