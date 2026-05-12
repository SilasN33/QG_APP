import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };
import { getPlayerByUserId, getAllPlayers } from "@/lib/queries/players";
import { getMatchesByPlayer, getAllMatches } from "@/lib/queries/matches";
import { computeAllStandings } from "@/lib/queries/standings";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/login");

  let myMatches:  Awaited<ReturnType<typeof getMatchesByPlayer>> = [];
  let allPlayers: Awaited<ReturnType<typeof getAllPlayers>>       = [];
  let allMatches: Awaited<ReturnType<typeof getAllMatches>>       = [];

  try {
    [myMatches, allPlayers, allMatches] = await Promise.all([
      getMatchesByPlayer(player.id),
      getAllPlayers(),
      getAllMatches(),
    ]);
  } catch {
    // renderiza com dados vazios se queries falharem
  }

  const allStandings   = computeAllStandings(allPlayers, allMatches);
  const myStanding     = allStandings.find((s) => s.player.id === player.id) ?? null;
  const groupStandings = player.group_letter
    ? allStandings.filter((s) => s.group_letter === player.group_letter)
    : [];

  return (
    <DashboardClient
      player={player}
      myMatches={myMatches}
      standing={myStanding}
      groupStandings={groupStandings}
    />
  );
}
