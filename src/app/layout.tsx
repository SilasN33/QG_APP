import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QG Open 2026",
  description: "Campeonato de Tênis QG Open 2026 — Compita. Supere. Seja Lendário.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1C4A35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
