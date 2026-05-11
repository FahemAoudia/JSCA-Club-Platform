import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jsca-ghbalou.local"),
  title: {
    default: "JSCA · Jeunesse Sportive Commune Aghbalou",
    template: "%s · JSCA",
  },
  description:
    "Application web officielle de gestion pour la JSCA · football et vie du club — Bouïra, Algérie.",
  openGraph: {
    title: "JSCA · Jeunesse Sportive Commune Aghbalou",
    description:
      "Inscriptions, vie du club, actualités JSCA · football.",
    locale: "fr_DZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-svh flex flex-col bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
