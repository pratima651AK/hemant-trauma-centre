"use client";

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();
  const isDark = false;

  const cards = [
    { title: t('about.exp'), desc: t('about.exp_desc') },
    { title: t('about.tech'), desc: t('about.tech_desc') },
    { title: t('about.care'), desc: t('about.care_desc') },
  ];

  return (
    <section id="about" className="py-24 bg-slate-100">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">{t('about.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div key={index} className="bg-white border-slate-200 hover:border-slate-300 p-8 rounded-2xl border transition duration-300 shadow-sm hover:-translate-y-2">
              <h3 className="text-2xl font-bold mb-4 text-primary">{card.title}</h3>
              <p className="text-slate-600 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
