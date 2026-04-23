import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/queries/players";
import { getMatchesByPlayer, getAllMatches } from "@/lib/queries/matches";
import { getAllPlayers } from "@/lib/queries/players";
import { computeAllStandings } from "@/lib/queries/standings";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);

  // Layout já deveria ter redirecionado, mas garantimos aqui também
  if (!player) redirect("/login");

  let myMatches: Awaited<ReturnType<typeof getMatchesByPlayer>> = [];
  let allPlayers: Awaited<ReturnType<typeof getAllPlayers>> = [];
  let allMatches: Awaited<ReturnType<typeof getAllMatches>> = [];

  try {
    [myMatches, allPlayers, allMatches] = await Promise.all([
      getMatchesByPlayer(player.id),
      getAllPlayers(),
      getAllMatches(),
    ]);
  } catch {
    // Se as queries falharem, renderiza o dashboard com dados vazios
  }

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
