"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-green-900 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="relative w-28 h-28 mb-6">
          <div className="w-28 h-28 rounded-full bg-green-800 border-2 border-green-700 flex items-center justify-center shadow-card-lg">
            <Image
              src="/logo.svg"
              alt="QG Open"
              width={80}
              height={80}
              onError={() => {}}
            />
          </div>
        </div>

        <div className="text-center mb-2">
          <h1 className="text-4xl font-black text-white tracking-tight leading-none">
            QG OPEN
          </h1>
          <span className="text-clay-400 text-2xl font-black">2026</span>
        </div>
        <p className="text-green-300 text-sm font-medium tracking-widest uppercase mb-10">
          Compita. Supere. Seja Lendário.
        </p>

        {/* Form */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-green-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-green-800/60 border border-green-700 text-white placeholder-green-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-clay-400 focus:ring-1 focus:ring-clay-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-green-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Senha
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-green-800/60 border border-green-700 text-white placeholder-green-600 rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none focus:border-clay-400 focus:ring-1 focus:ring-clay-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-clay-300 text-sm text-center bg-clay-600/20 border border-clay-600/40 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={loading}
              className="mt-2 font-bold tracking-wide"
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-green-600 text-xs">
              Acesso exclusivo para jogadores inscritos
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
