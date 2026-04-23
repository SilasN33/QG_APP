import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/queries/players";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { PlayerProvider } from "@/components/layout/PlayerProvider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);
  if (!player) redirect("/setup");

  return (
    <PlayerProvider player={player}>
      <div className="min-h-screen bg-surface-1">
        <AppHeader />
        <main className="pt-14 pb-28 max-w-md mx-auto">{children}</main>
        <BottomNav />
      </div>
    </PlayerProvider>
  );
}
