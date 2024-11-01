import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/sonner";
import { StorageProvider } from "@/components/storage";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Altverse",
  description: "Trustless, Instant Cross-Chain Swaps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(manrope.variable, "font-sans")}>
      <body
        className={cn(
          "min-h-screen bg-black font-sans antialiased",
        )}
      >
        <StorageProvider>
        {children}
        <Toaster
              richColors
              theme="dark"
              toastOptions={{
                duration: 5000,
              }}
            />
        </StorageProvider>
      </body>
    </html>
  );
}