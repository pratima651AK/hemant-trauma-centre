"use client";

import { useLanguage } from '../context/LanguageContext';
import { Map, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();
  const isDark = false;

  return (
    <footer className="py-16 border-t bg-slate-50 border-slate-200 text-slate-600 transition-colors">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 text-center md:text-left mb-12">
           <div className="space-y-4">
              <h3 className="font-bold text-primary text-xl">Hemant Trauma Centre</h3>
              <p className="text-sm">Expert orthopedic and trauma care available 24/7. Saving lives with dedication and technology.</p>
           </div>
           
           <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Contact Us</h4>
              <ul className="space-y-3">
                 <li className="flex items-center justify-center md:justify-start gap-3">
                    <Phone size={18} className="text-primary" />
                    <span>+91 0000 000000 (Placeholder)</span>
                 </li>
                 <li className="flex items-center justify-center md:justify-start gap-3">
                    <Mail size={18} className="text-primary" />
                    <span>info@hemanttrauma.com (Placeholder)</span>
                 </li>
              </ul>
           </div>

           <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Address</h4>
              <div className="flex items-start justify-center md:justify-start gap-3">
                 <MapPin size={18} className="text-primary mt-1" />
                 <span>Tilkamanjhi Thana Road,<br />Opposite Sheela Chamber Hotel,<br />Tulsingar Colony, Bhagalpur, Bihar 812001</span>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="font-bold text-slate-900">Location</h4>
              <div className="space-y-3">
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Hemant+Trauma+and+Sport+Injury+Centre+Bhagalpur" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-3 text-primary hover:underline"
                >
                   <Map size={18} />
                   <span>View on Google Maps</span>
                </a>
                <div className="text-xs text-slate-400 mt-2">
                  Plus Code: 7232+CJ Bhagalpur
                </div>
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-slate-200 text-center">
          <p className="text-sm">&copy; {t('footer.copy')} | Hemant Trauma and Sport Injury Centre</p>
        </div>
      </div>
    </footer>
  );
}
