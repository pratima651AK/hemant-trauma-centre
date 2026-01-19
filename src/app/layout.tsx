import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import ThemeWrapper from "@/components/ThemeWrapper";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hemant Trauma and Sport Injury Centre | Bhagalpur's Premier Orthopedic Care",
  description: "Specialized Orthopedic and Trauma Care in Bhagalpur. 24/7 Emergency, Spine Surgery, Joint Replacement, and Sports Injury Center.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "name": "Hemant Trauma and Sport Injury Centre",
    "alternateName": "Hemant Trauma Centre",
    "description": "Expert orthopedic and trauma care in Bhagalpur specializing in spine surgery, joint replacement, and sports injuries.",
    "url": "https://hemant-trauma-centre.vercel.app", // Adjust if needed
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tilkamanjhi Thana Road, Opposite Sheela Chamber Hotel, Tulsinagar Colony",
      "addressLocality": "Bhagalpur",
      "addressRegion": "Bihar",
      "postalCode": "812001",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "25.2536",
      "longitude": "87.0019"
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "medicalSpecialty": ["Orthopedic", "Surgery", "EmergencyCare"]
  };

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <ThemeWrapper fontClass={outfit.className}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </ThemeWrapper>
    </html>
  );
}
