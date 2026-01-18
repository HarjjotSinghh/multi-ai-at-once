import type { Metadata } from "next";
import { Syncopate, Space_Mono } from "next/font/google";
import "./globals.css";

const syncopate = Syncopate({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-syncopate",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MULTI_AI_NEXUS // V1.0",
  description: "Advanced neural network interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${syncopate.variable} ${spaceMono.variable} antialiased bg-cyber-black text-cyber-text min-h-screen bg-cyber-grid bg-grid-sm selection:bg-neon-green selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}

