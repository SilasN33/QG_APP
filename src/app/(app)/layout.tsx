import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/queries/players";
import { AppHeader } from "@/components/layout/AppHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { PlayerProvider } from "@/components/layout/PlayerProvider";
import { ContextPanelProvider } from "@/components/layout/ContextPanelProvider";
import { ContextPanel } from "@/components/layout/ContextPanel";

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
      <ContextPanelProvider>
        <div className="min-h-screen bg-surface-1">
          {/* Sidebar — visível apenas em md+ */}
          <SidebarNav />

          {/* Área de conteúdo — empurrada pelo sidebar em md+ */}
          <div className="md:ml-16 lg:ml-60">
            <AppHeader />
            <main className="pt-14 pb-28 md:pb-8 max-w-md mx-auto">
              {children}
            </main>
          </div>

          {/* Bottom nav — apenas no mobile */}
          <BottomNav />
          <ContextPanel />
        </div>
      </ContextPanelProvider>
    </PlayerProvider>
  );
}
