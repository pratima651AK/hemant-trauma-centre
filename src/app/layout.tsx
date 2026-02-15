import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import ThemeWrapper from "@/components/ThemeWrapper";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HemantTraumaCentre | Best Orthopedic Doctor in Bhagalpur",
  description: "Expert orthopedic care for fractures, sports injuries, and trauma in Bhagalpur. Dr. Himanshu Kumar Hemant provides affordable and advanced bone treatment.",
  keywords: [
    "Orthopedic Doctor Bhagalpur", "Fracture Clinic", "Bone Specialist", 
    "Trauma Centre", "Haddi Doctor", "Plaster Doctor", 
    "Small Bone Clinic", "Leg Fracture Treatment",
    "हड्डी का डॉक्टर", "भागलपुर में हड्डी रोग विशेषज्ञ", "टूटी हड्डी का इलाज", "प्लास्टर डॉक्टर",
    "Haddi Ke Doctor", "Bhagalpur Haddi Hospital", "Kam kharch me ilaj", 
    "Best fracture doctor", "HemantTraumaCentre"
  ],
  authors: [{ name: "Dr. Himanshu Kumar Hemant" }],
  openGraph: {
    title: "HemantTraumaCentre | Expert Orthopedic Care in Bhagalpur",
    description: "Specialized treatment for fractures, sports injuries, and joint problems. Trusted bone doctor in Bhagalpur.",
    url: "https://hemant-trauma-centre.vercel.app",
    siteName: "HemantTraumaCentre",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HemantTraumaCentre | Bhagalpur",
    description: "Expert orthopedic and trauma care in Bhagalpur.",
  },
  robots: {
    index: true,
    follow: true,
  },
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
    "alternateName": "HemantTraumaCentre",
    "description": "Expert orthopedic and trauma care in Bhagalpur specializing in spine surgery, joint replacement, and sports injuries.",
    "url": "https://hemant-trauma-centre.vercel.app",
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
    "telephone": "+919955868599",
    "email": "info@hemanttrauma.com",
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
