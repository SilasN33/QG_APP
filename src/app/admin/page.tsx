import { getAllPlayers } from "@/lib/queries/players";
import { getAllMatches } from "@/lib/queries/matches";
import Link from "next/link";
import { Users, Layers, ChevronRight, CheckCircle } from "lucide-react";

export default async function AdminPage() {
  const [players, matches] = await Promise.all([getAllPlayers(), getAllMatches()]);

  const assigned = players.filter((p) => p.group_letter !== null).length;
  const completedMatches = matches.filter((m) => m.status === "completed" || m.status === "wo").length;

  const cards = [
    {
      href: "/admin/jogadores",
      icon: Users,
      title: "Jogadores",
      description: `${assigned} de ${players.length} com grupo atribuído`,
      cta: "Gerenciar jogadores",
      done: assigned === players.length && players.length > 0,
    },
    {
      href: "/admin/partidas",
      icon: Layers,
      title: "Partidas",
      description: matches.length === 0
        ? "Nenhuma partida gerada"
        : `${completedMatches} de ${matches.length} concluídas`,
      cta: matches.length === 0 ? "Gerar partidas de grupo" : "Gerenciar partidas",
      done: false,
    },
  ];

  return (
    <div className="px-4 py-5 space-y-4">
      <div>
        <h1 className="text-xl font-black text-gray-900">Configurar Torneio</h1>
        <p className="text-sm text-gray-500 mt-0.5">QG Open 2026 — Painel administrativo</p>
      </div>

      {cards.map(({ href, icon: Icon, title, description, cta, done }) => (
        <Link
          key={href}
          href={href}
          className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-gray-200 transition-all active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${done ? "bg-green-100" : "bg-gray-100"}`}>
              {done ? <CheckCircle size={20} className="text-green-700" /> : <Icon size={20} className="text-gray-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 text-sm">{title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              <p className="text-xs text-clay-500 font-semibold mt-2">{cta} →</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
          </div>
        </Link>
      ))}
    </div>
  );
}
