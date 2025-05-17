import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
} 