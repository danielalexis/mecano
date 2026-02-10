import type { Metadata } from "next";
import { Teko, JetBrains_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/language-provider";
import "./globals.css";

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Mecano - Garage Management",
  description: "Manage your garage with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${teko.variable} ${jetbrainsMono.variable} antialiased bg-zinc-950 text-zinc-100 selection:bg-orange-500 selection:text-white`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
