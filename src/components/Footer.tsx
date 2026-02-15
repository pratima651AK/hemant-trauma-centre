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
              <li>
                <a href="tel:9955868599" className="flex items-center justify-center md:justify-start gap-3 hover:text-primary transition-colors">
                  <Phone size={18} className="text-primary" />
                  <span>9955868599</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@hemanttrauma.com" className="flex items-center justify-center md:justify-start gap-3 hover:text-primary transition-colors">
                  <Mail size={18} className="text-primary" />
                  <span>info@hemanttrauma.com</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Address</h4>
            <a 
              href="https://www.google.com/maps/search/?api=1&query=Hemant+Trauma+and+Sport+Injury+Centre+Bhagalpur" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-start justify-center md:justify-start gap-3 hover:text-primary transition-colors"
            >
              <MapPin size={18} className="text-primary mt-1" />
              <span>Tilkamanjhi Thana Road,<br />Opposite Sheela Chamber Hotel,<br />Tulsingar Colony, Bhagalpur, Bihar 812001</span>
            </a>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900">Location</h4>
            <div className="space-y-4">
              {/* Interactive Map Embed */}
              <div className="w-full h-32 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3606.8735235338165!2d87.0019!3d25.2536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjXCsDE1JzEyLjkiTiA4N8KwMDAnMDYuOCJF!5e0!3m2!1sen!2sin!4v1705680000000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=25.2536,87.0019&destination_place_id=7232%2BCJ+Bhagalpur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-3 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition-all text-sm"
                >
                  <MapPin size={16} />
                  <span>Get Directions</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Hemant+Trauma+and+Sport+Injury+Centre+Bhagalpur"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-3 text-primary hover:underline text-sm font-medium"
                >
                  <Map size={16} />
                  <span>View on Google Maps</span>
                </a>
              </div>
              <div className="text-[10px] text-slate-400">
                Plus Code: 7232+CJ Bhagalpur
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} HemantTraumaCentre. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
