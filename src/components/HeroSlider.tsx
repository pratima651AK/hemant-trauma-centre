'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const images = [
  {
    src: '/assets/medical_slider_1.png',
    alt: 'Trauma Centre Interior'
  },
  {
    src: '/assets/medical_slider_2.png',
    alt: 'Advanced Equipment'
  },
  {
    src: '/assets/medical_slider_3.png',
    alt: 'Medical Team'
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-200 dark:bg-slate-800">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover"
            priority={idx === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            loading={idx === 0 ? 'eager' : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        </div>
      ))}
      
      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === current ? 'w-8 bg-primary' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Overlay Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center p-8 bg-slate-900/20 backdrop-blur-sm rounded-2xl border border-white/10 z-20">
            <h3 className="text-2xl font-bold text-white mb-2">Hemant Trauma Centre</h3>
            <p className="text-primary-light font-medium">State-of-the-Art Facilities</p>
        </div>
      </div>
    </div>
  );
}
