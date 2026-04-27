import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-display text-8xl font-bold text-lime-500 lime-glow">404</p>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-white">Página não encontrada</h1>
        <p className="text-sm text-white/50">Essa quadra não existe no torneio.</p>
      </div>
      <Link
        href="/dashboard"
        className="mt-2 rounded-xl bg-lime-500 px-6 py-3 text-sm font-semibold text-surface-0 transition-opacity hover:opacity-90"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
