import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "QG Open 2026",
    template: "%s · QG Open 2026",
  },
  description: "Campeonato de Tênis QG Open 2026 — Compita. Supere. Seja Lendário.",
  manifest: "/manifest.json",
  openGraph: {
    title: "QG Open 2026",
    description: "Campeonato de Tênis QG Open 2026 — Compita. Supere. Seja Lendário.",
    type: "website",
    locale: "pt_BR",
    siteName: "QG Open 2026",
  },
  twitter: {
    card: "summary",
    title: "QG Open 2026",
    description: "Campeonato de Tênis QG Open 2026 — Compita. Supere. Seja Lendário.",
  },
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
