import { getAllPlayers } from "@/lib/queries/players";
import { AdminJogadoresClient } from "./AdminJogadoresClient";

export default async function AdminJogadoresPage() {
  const players = await getAllPlayers();
  return <AdminJogadoresClient players={players} />;
}
