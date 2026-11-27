import type { Metadata, Viewport } from "next";
import { Inter, Newsreader, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader", style: ["normal", "italic"], weight: ["500", "600"], display: "swap" });
const spaceMono = Space_Mono({ subsets: ["latin"], variable: "--font-space-mono", weight: ["400", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "PLEIONE TMS", template: "%s · PLEIONE TMS" },
  description: "Gestão de transportes do ecossistema ASTRAEUS: cargas, roteiros, fretes, rastreio e entrega.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF1E4" },
    { media: "(prefers-color-scheme: dark)", color: "#161D1B" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${newsreader.variable} ${spaceMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Gambetta (Fontshare) é a fonte de títulos da marca; Newsreader é o substituto se não carregar. */}
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=gambetta@500,501,600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
