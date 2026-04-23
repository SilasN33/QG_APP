import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPlayerByUserId } from "@/lib/queries/players";
import Link from "next/link";
import { ChevronLeft, Settings, Users, Layers } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const player = await getPlayerByUserId(user.id);

  if (!player?.is_admin) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-[#F4F6F5]">
      {/* Admin header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors">
          <ChevronLeft size={22} className="text-gray-300" />
        </Link>
        <div className="flex items-center gap-2">
          <Settings size={16} className="text-gray-400" />
          <span className="text-white font-bold text-sm tracking-wide">PAINEL ADMIN</span>
        </div>
        <div className="w-9" />
      </header>

      <div className="pt-14 max-w-md mx-auto">
        {/* Admin nav */}
        <nav className="flex border-b border-gray-200 bg-white">
          <Link href="/admin" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-gray-900 transition-colors text-xs font-semibold">
            <Settings size={18} />
            Visão Geral
          </Link>
          <Link href="/admin/jogadores" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-gray-900 transition-colors text-xs font-semibold">
            <Users size={18} />
            Jogadores
          </Link>
          <Link href="/admin/partidas" className="flex-1 flex flex-col items-center gap-1 py-3 text-gray-500 hover:text-gray-900 transition-colors text-xs font-semibold">
            <Layers size={18} />
            Partidas
          </Link>
        </nav>

        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
