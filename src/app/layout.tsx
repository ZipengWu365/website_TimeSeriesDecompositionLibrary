import type { Metadata } from "next";
import { JetBrains_Mono, Source_Serif_4, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Sidebar } from "@/components/sidebar";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Source_Serif_4({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TSDecomp Benchmark",
  description:
    "Component recovery benchmark for interpretable time-series decomposition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
              {children}
            </main>
          </div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
