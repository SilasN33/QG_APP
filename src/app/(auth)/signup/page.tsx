"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Digite seu nome completo.");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError || !data.user) {
      setError(
        signUpError?.message === "User already registered"
          ? "Este email já está cadastrado."
          : "Erro ao criar conta. Tente novamente."
      );
      setLoading(false);
      return;
    }

    // Auto-create player profile with the user's name
    const { error: playerError } = await supabase
      .from("players")
      .insert({ name: name.trim(), user_id: data.user.id });

    if (playerError) {
      setError("Conta criada, mas houve um erro ao criar seu perfil. Contacte o organizador.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-green-900 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="w-20 h-20 rounded-full bg-green-800 border-2 border-green-700 flex items-center justify-center shadow-card-lg mb-6">
          <Image src="/logo.svg" alt="QG Open" width={56} height={56} />
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white">Criar Conta</h1>
          <p className="text-green-400 text-sm mt-1">
            Acesso exclusivo para jogadores do QG Open 2026
          </p>
        </div>

        <div className="w-full max-w-sm">
          <form onSubmit={handleSignup} className="space-y-4">
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
                  className="w-full bg-green-800/60 border border-green-700 text-white placeholder-green-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-clay-400 focus:ring-1 focus:ring-clay-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-green-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" />
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
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="block text-green-300 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-green-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full bg-green-800/60 border border-green-700 text-white placeholder-green-600 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-clay-400 focus:ring-1 focus:ring-clay-400 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-clay-300 text-sm text-center bg-clay-600/20 border border-clay-600/40 rounded-lg py-2 px-3">
                {error}
              </p>
            )}

            <Button type="submit" fullWidth size="lg" disabled={loading} className="mt-2 font-bold">
              {loading ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-green-500 text-sm">
              Já tem conta?{" "}
              <Link href="/login" className="text-clay-400 font-bold hover:text-clay-300">
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
