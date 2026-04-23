"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createPlayerAction } from "@/lib/actions/createPlayer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [emailSent,       setEmailSent]       = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Digite seu nome completo."); return; }
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name.trim() } },
    });

    if (signUpError || !data.user) {
      setError(
        signUpError?.message === "User already registered"
          ? "Este email já está cadastrado."
          : "Erro ao criar conta. Tente novamente."
      );
      setLoading(false);
      return;
    }

    if (data.session) {
      const { error: playerError } = await createPlayerAction(name.trim());
      if (playerError) {
        setError("Conta criada, mas erro ao criar perfil. Tente fazer login.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-lime-500/15 border border-lime-500/30 flex items-center justify-center mb-6">
          <CheckCircle size={30} className="text-lime-500" />
        </div>
        <div className="text-center max-w-xs">
          <h1 className="font-display font-bold text-2xl text-white mb-3">Verifique seu email</h1>
          <p className="text-white/40 text-sm leading-relaxed">
            Enviamos um link para{" "}
            <strong className="text-white/70">{email}</strong>.
            Clique no link para ativar sua conta.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block text-lime-500 font-semibold text-sm hover:text-lime-400 transition-colors"
          >
            Ir para o login →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-0 flex flex-col relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg,  transparent, transparent 59px, rgba(201,241,53,0.035) 59px, rgba(201,241,53,0.035) 60px),
            repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(201,241,53,0.035) 59px, rgba(201,241,53,0.035) 60px)
          `,
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(9,27,19,0.8),transparent)]" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-lime-500 shadow-glow mb-5">
            <span className="font-display font-bold text-surface-0 text-base tracking-tight">QG</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-white">Criar Conta</h1>
          <p className="text-white/30 text-sm mt-1">Acesso exclusivo — QG Open 2026</p>
        </div>

        <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <form onSubmit={handleSignup} className="space-y-3">
            {[
              { label: "Nome Completo", type: "text",     value: name,     setter: setName,     placeholder: "Seu nome completo" },
              { label: "Email",        type: "email",    value: email,    setter: setEmail,    placeholder: "seu@email.com" },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label className="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  required
                  className="w-full bg-surface-2 border border-white/[0.08] text-white placeholder-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/30 transition-all"
                />
              </div>
            ))}

            <div>
              <label className="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
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

            <div>
              <label className="block text-white/35 text-[10px] font-bold uppercase tracking-widest mb-2">
                Confirmar Senha
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha"
                required
                className="w-full bg-surface-2 border border-white/[0.08] text-white placeholder-white/20 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/30 transition-all"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
                {error}
              </p>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" disabled={loading} className="font-display font-bold tracking-wide">
                {loading ? "Criando conta..." : "Criar Conta"}
              </Button>
            </div>
          </form>

          <p className="text-white/25 text-sm text-center mt-6">
            Já tem conta?{" "}
            <Link href="/login" className="text-lime-500/80 font-semibold hover:text-lime-500 transition-colors">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
