"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPlayerAction } from "@/lib/actions/createPlayer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { User } from "lucide-react";
import Image from "next/image";

export default function SetupPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Pré-preenche o nome se o usuário passou pelo signup com confirmação de email
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      const savedName = user?.user_metadata?.display_name as string | undefined;
      if (savedName) setName(savedName);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    const { error: actionError } = await createPlayerAction(name.trim());

    if (actionError) {
      setError(actionError);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-green-900 flex flex-col items-center justify-center px-6">
      <div className="w-20 h-20 rounded-full bg-green-800 border-2 border-green-700 flex items-center justify-center shadow-lg mb-6">
        <Image src="/logo.svg" alt="QG Open" width={56} height={56} />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-white">Completar Cadastro</h1>
        <p className="text-green-400 text-sm mt-1 max-w-xs">
          Informe seu nome para entrar no torneio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div>
          <label className="block text-green-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Nome Completo
          </label>
          <div className="relative">
            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              required
              autoFocus
              className="w-full bg-green-800/60 border border-green-700 text-white placeholder-green-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-clay-400 focus:ring-1 focus:ring-clay-400 transition-colors"
            />
          </div>
        </div>

        {error && (
          <p className="text-clay-300 text-sm text-center bg-clay-600/20 border border-clay-600/40 rounded-lg py-2 px-3">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth size="lg" disabled={loading || !name.trim()} className="font-bold">
          {loading ? "Salvando..." : "Entrar no Torneio"}
        </Button>
      </form>
    </div>
  );
}
