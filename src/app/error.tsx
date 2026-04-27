"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-surface-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="font-display text-8xl font-bold text-clay-400">!</p>
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-2xl font-bold text-white">Erro inesperado</h2>
          <p className="text-sm text-white/50">Algo falhou no servidor. Tente recarregar.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" onClick={reset}>Recarregar</Button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 bg-surface-3 hover:bg-surface-4 text-white/80 border border-white/[0.08] px-5 py-2.5 text-sm"
          >
            Início
          </Link>
        </div>
      </body>
    </html>
  );
}
