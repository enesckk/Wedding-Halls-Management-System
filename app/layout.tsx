import React from "react";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import { UserProvider } from "@/lib/user-context";
import "./globals.css";

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nikah Salonları Yönetim Sistemi",
  description: "Belediye nikah salonları yönetim ve rezervasyon sistemi",
  generator: "v0.app",
};

export const viewport: Viewport = {
  themeColor: "#1F7A5A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <UserProvider>
          {children}
        </UserProvider>
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
