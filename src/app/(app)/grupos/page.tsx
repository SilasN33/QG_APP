import type { Metadata } from "next";
import { getAllPlayers } from "@/lib/queries/players";

export const metadata: Metadata = { title: "Grupos" };
import { getAllMatches } from "@/lib/queries/matches";
import { computeAllStandings } from "@/lib/queries/standings";
import { GruposClient } from "./GruposClient";

export default async function GruposPage() {
  const [allPlayers, allMatches] = await Promise.all([
    getAllPlayers(),
    getAllMatches(),
  ]);

  const allStandings = computeAllStandings(allPlayers, allMatches);
  const groupMatches = allMatches.filter((m) => m.phase === "group");

  return (
    <GruposClient
      allStandings={allStandings}
      groupMatches={groupMatches}
    />
  );
}
