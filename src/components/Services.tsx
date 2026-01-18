"use client";

import { useLanguage } from '../context/LanguageContext';

export default function Services() {
  const { t } = useLanguage();
  const isDark = false;

  const services = [
    { icon: "🚑", title: t('services.trauma'), desc: t('services.trauma_desc'), color: "from-red-500 to-red-600" },
    { icon: "🏃", title: t('services.sport'), desc: t('services.sport_desc'), color: "from-orange-500 to-amber-500" },
    { icon: "🦴", title: t('services.fracture'), desc: t('services.fracture_desc'), color: "from-indigo-500 to-purple-600" },
    { icon: "🤸", title: t('services.physio'), desc: t('services.physio_desc'), color: "from-emerald-500 to-teal-600" },
    { icon: "🔬", title: t('services.arthro'), desc: t('services.arthro_desc'), color: "from-blue-500 to-cyan-500" },
    { icon: "🚨", title: t('services.emergency'), desc: t('services.emergency_desc'), color: "from-rose-500 to-pink-600" }
  ];

  return (
    <section id="services" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-slate-900">{t('services.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div key={index} className="group bg-slate-50 border-slate-200 hover:border-primary p-6 rounded-2xl border transition duration-300 shadow-sm hover:shadow-md">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl mb-6 shadow-lg`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{service.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm">{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
