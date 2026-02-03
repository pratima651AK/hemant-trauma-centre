'use client';

import WhatsAppButton from "./WhatsAppButton";

import { usePathname } from "next/navigation";

export default function ThemeWrapper({ children, fontClass }: { children: React.ReactNode, fontClass: string }) {
  // Simplified to only support Lite theme
  const themeClasses = "bg-slate-50 text-slate-900";
  const pathname = usePathname();
  // Don't show WhatsApp button on admin pages
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <body
      className={`${fontClass} ${themeClasses} antialiased transition-colors duration-300 relative`}
      suppressHydrationWarning
    >
      {children}
      {!isAdmin && <WhatsAppButton />}
    </body>
  );
}
