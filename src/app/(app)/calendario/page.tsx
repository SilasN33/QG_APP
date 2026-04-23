import { getAllMatches } from "@/lib/queries/matches";
import { CalendarioClient } from "./CalendarioClient";

export default async function CalendarioPage() {
  const allMatches = await getAllMatches();
  return <CalendarioClient allMatches={allMatches} />;
}
