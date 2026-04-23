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

  // Player record not found — user is authenticated but has no profile.
  // Send to /setup instead of /login to avoid a redirect loop with the middleware.
  if (!player) redirect("/setup");

  return (
    <PlayerProvider player={player}>
      <div className="min-h-screen bg-[#F4F6F5]">
        <AppHeader />
        <main className="pt-14 pb-20 max-w-md mx-auto">{children}</main>
        <BottomNav />
      </div>
    </PlayerProvider>
  );
}
