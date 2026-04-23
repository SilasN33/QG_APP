import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId, getAllPlayers } from "@/lib/queries/players";
import { getMatchesByPlayer, getAllMatches } from "@/lib/queries/matches";
import { computeAllStandings } from "@/lib/queries/standings";
import { PerfilClient } from "./PerfilClient";

export default async function PerfilPage() {
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
  const standing = allStandings.find((s) => s.player.id === player.id) ?? null;

  return <PerfilClient player={player} standing={standing} matchCount={myMatches.length} />;
}
