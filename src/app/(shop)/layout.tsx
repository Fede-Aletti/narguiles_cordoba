import type React from "react";
import { Montserrat, Playfair_Display } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { Providers } from "../providers";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  title: "Luxury Hookah | Premium Shisha Experience",
  description:
    "Discover our premium collection of luxury hookahs, shishas, and accessories.",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${playfair.variable} bg-slate-900 min-h-screen font-sans`}
      >
        <SiteHeader />
        <main className="flex flex-col flex-1 min-h-screen">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
