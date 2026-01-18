import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import ThemeWrapper from "@/components/ThemeWrapper";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hemant Trauma Centre | 24/7 Advanced Care",
  description: "Premier Trauma Centre & Multi-Specialty Hospital. 24/7 Emergency, ICU, Orthopedics, and Critical Care Services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <ThemeWrapper fontClass={outfit.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeWrapper>
    </html>
  );
}
