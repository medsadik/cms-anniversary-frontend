import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import DefaultErrorBoundary from "./error-boundary/DefaultErrorBoundary";
import ClientProviders from "./client-providers"; // ✅ New client component

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cms anniversary",
  description: "Created with love",
  generator: "cms",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <DefaultErrorBoundary>
          <ClientProviders>
            {children}
            <Analytics />
          </ClientProviders>
        </DefaultErrorBoundary>
      </body>
    </html>
  );
}
