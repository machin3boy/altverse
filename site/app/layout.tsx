import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "AltVerse",
  description: "Trustless, Instant Cross-Chain Swaps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.className}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          manrope.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}