"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
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
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col relative overflow-hidden">
      {/* Subtle court-line grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,  transparent, transparent 59px, rgba(201,241,53,0.035) 59px, rgba(201,241,53,0.035) 60px),
            repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(201,241,53,0.035) 59px, rgba(201,241,53,0.035) 60px)
          `,
        }}
      />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(9,27,19,0.8),transparent)]" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-10 relative z-10">
        {/* Wordmark */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-500 shadow-glow mb-6">
            <span className="font-display font-bold text-surface-0 text-xl tracking-tight">QG</span>
          </div>
          <h1 className="font-display font-bold text-white text-5xl leading-none tracking-tight">
            QG OPEN
          </h1>
          <p className="font-display font-bold text-lime-500 text-3xl leading-none mt-1">2026</p>
          <p className="text-white/30 text-xs font-semibold tracking-[0.25em] uppercase mt-4">
            Compita · Supere · Seja Lendário
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full bg-surface-2 border border-white/[0.08] text-white placeholder-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-2 border border-white/[0.08] text-white placeholder-white/20 rounded-xl px-4 pr-11 py-3.5 text-sm focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" disabled={loading} className="font-display font-bold tracking-wide">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
          </form>

          <p className="text-white/25 text-xs text-center mt-6">
            Acesso exclusivo para participantes do torneio.
          </p>
        </div>
      </div>
    </div>
  );
}
