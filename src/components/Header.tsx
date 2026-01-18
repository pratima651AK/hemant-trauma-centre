"use client";

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const isDark = false;

  return (
    <header className="fixed w-full top-0 bg-white/90 border-slate-200 backdrop-blur-md z-50 border-b py-4 transition-colors">
      <nav className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold">+</div>
             <div className="text-xl md:text-2xl font-bold text-slate-900">
                Hemant <span className="text-primary">Trauma Centre</span>
             </div>
           </div>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <ul className="flex gap-8 text-slate-600 font-medium">
             <li><a href="#home" className="hover:text-primary transition">{t('nav.home')}</a></li>
             <li><a href="#services" className="hover:text-primary transition">{t('nav.services')}</a></li>
             <li><a href="#about" className="hover:text-primary transition">{t('nav.about')}</a></li>
          </ul>
          <div className="flex items-center gap-4">
             <div className="hidden lg:block text-red-400 font-bold animate-pulse">
                {t('nav.emergency')}
             </div>
            <button onClick={toggleLang} className="text-sm font-semibold text-primary border border-primary/30 px-3 py-1 rounded hover:bg-primary/10 transition">
              {language === 'en' ? 'हिंदी' : 'En'}
            </button>
            <a href="#appointment" className="bg-primary hover:bg-blue-500 text-white px-6 py-2 rounded-full font-semibold shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition">
              {t('nav.book')}
            </a>
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center gap-4">
           <button onClick={toggleLang} className="text-sm font-semibold text-primary">
              {language === 'en' ? 'हिंदी' : 'En'}
            </button>
           <button className="text-slate-900 text-2xl" onClick={() => setIsOpen(!isOpen)}>
             {isOpen ? '✕' : '☰'}
           </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-slate-200 border-b p-4 flex flex-col gap-4 shadow-xl">
           <a href="#home" className="text-slate-600 hover:text-primary" onClick={() => setIsOpen(false)}>{t('nav.home')}</a>
           <a href="#services" className="text-slate-600 hover:text-primary" onClick={() => setIsOpen(false)}>{t('nav.services')}</a>
           <a href="#about" className="text-slate-600 hover:text-primary" onClick={() => setIsOpen(false)}>{t('nav.about')}</a>
           <div className="text-red-400 font-bold py-2 border-t border-slate-100">{t('nav.emergency')}</div>
           <a href="#appointment" className="text-primary font-semibold" onClick={() => setIsOpen(false)}>{t('nav.book')}</a>
        </div>
      )}
    </header>
  );
}
