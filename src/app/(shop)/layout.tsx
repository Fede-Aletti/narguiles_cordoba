import type React from "react";
import { Montserrat, Playfair_Display } from "next/font/google";
import "../globals.css";
import { SiteHeader } from "@/components/sections/site-header";
import { SiteFooter } from "@/components/sections/site-footer";
import { WhatsAppFloat } from "@/components/ui/whatsapp-float";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <main className="flex flex-col flex-1 min-h-screen">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </main>
  );
}
