"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <p className="font-display text-5xl font-bold text-clay-400">!</p>
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold text-white">Algo deu errado</h2>
        <p className="text-sm text-white/50">Ocorreu um erro ao carregar esta página.</p>
      </div>
      <Button variant="secondary" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
