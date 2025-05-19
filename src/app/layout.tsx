import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { Montserrat, Playfair_Display } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata = {
  title: "Narguilas Córdoba",
  description:
    "Narguilas Córdoba, tu tienda de narguilas y accesorios de shisha.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${montserrat.variable} ${playfair.variable} dark`}>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
} 