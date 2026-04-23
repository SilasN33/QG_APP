import { getAllPlayers } from "@/lib/queries/players";
import { getAllMatches } from "@/lib/queries/matches";
import { AdminPartidasClient } from "./AdminPartidasClient";

export default async function AdminPartidasPage() {
  const [players, matches] = await Promise.all([getAllPlayers(), getAllMatches()]);
  return <AdminPartidasClient players={players} matches={matches} />;
}
