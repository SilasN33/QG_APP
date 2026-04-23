import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId, getAllPlayers } from "@/lib/queries/players";
import { getAllMatches } from "@/lib/queries/matches";
import { computeAllStandings, computeGlobalRanking } from "@/lib/queries/standings";
import { RankingClient } from "./RankingClient";

export default async function RankingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [currentPlayer, allPlayers, allMatches] = await Promise.all([
    getPlayerByUserId(user.id),
    getAllPlayers(),
    getAllMatches(),
  ]);

  const allStandings = computeAllStandings(allPlayers, allMatches);
  const globalRanking = computeGlobalRanking(allStandings);

  return (
    <RankingClient
      globalRanking={globalRanking}
      currentPlayerId={currentPlayer?.id ?? null}
    />
  );
}
