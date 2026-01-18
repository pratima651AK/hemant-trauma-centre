"use client";

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import HeroSlider from './HeroSlider';

export default function Hero() {
  const { t } = useLanguage();
  const isDark = false;

  return (
    <section id="home" className="min-h-screen flex items-center pt-28 pb-20 md:pt-20 md:pb-0 relative overflow-hidden bg-slate-50">
      <div className="container mx-auto px-6 z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl text-center md:text-left">
                <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-bold mb-6 border border-primary/20">
                    Trusted Healthcare Partner
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight text-slate-900">
                    {t('hero.title1')} <br /> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
                    {t('hero.title2')}
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-10 mx-auto md:mx-0 max-w-lg">
                    {t('hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
                    <a href="#appointment" className="px-8 py-4 text-center rounded-lg bg-primary hover:bg-blue-500 text-white font-bold shadow-lg shadow-primary/30 hover:-translate-y-1 transition">
                    {t('hero.cta_book')}
                    </a>
                    <a href="#services" className="px-8 py-4 text-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition">
                    {t('hero.cta_services')}
                    </a>
                </div>
            </div>
            {/* Slider in the right section - visible on desktop, smaller/stacks on mobile if needed */}
            <div className="relative w-full">
                <HeroSlider />
            </div>
        </div>
      </div>
    </section>
  );
}
