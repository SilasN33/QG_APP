import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/queries/players";
import { getMatchesByPlayer, getAllMatches } from "@/lib/queries/matches";
import { getAllPlayers } from "@/lib/queries/players";
import { computeAllStandings } from "@/lib/queries/standings";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const player = await getPlayerByUserId(user!.id);
  if (!player) return null;

  const [myMatches, allPlayers, allMatches] = await Promise.all([
    getMatchesByPlayer(player.id),
    getAllPlayers(),
    getAllMatches(),
  ]);

  const allStandings = computeAllStandings(allPlayers, allMatches);
  const myStanding = allStandings.find((s) => s.player.id === player.id) ?? null;

  return (
    <DashboardClient
      player={player}
      myMatches={myMatches}
      standing={myStanding}
    />
  );
}
