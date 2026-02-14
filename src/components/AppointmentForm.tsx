"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, XCircle, Home, MapPin, Phone as PhoneIcon, RotateCcw } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

interface FormData {
  name: string;
  mobile: string;
  email: string;
  message: string;
  turnstileToken?: string;
}

export default function AppointmentForm() {
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    mobile: '',
    email: '',
    message: '',
    turnstileToken: ''
  });
  const [error, setError] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [isSavingLead, setIsSavingLead] = useState<boolean>(false);

  // Validation Logic
  const validateStep1 = () => {
    const mobileRegex = /^[0-9]{10}$/;
    if (!formData.name.trim()) {
      setError("Please enter your name");
      return false;
    }
    if (!mobileRegex.test(formData.mobile)) {
      setError(t('appointment.errors.mobile'));
      return false;
    }
    setError('');
    return true;
  };

  const validateStep2 = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError(t('appointment.errors.email') || "Please enter a valid email address");
      return false;
    }
    setError('');
    return true;
  };

  const validateTurnstile = () => {
    if (!formData.turnstileToken) {
      setError("Please complete the security check");
      return false;
    }
    return true;
  };

  const handleNext = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (validateStep1()) {
      // Jump to next step immediately
      setStep(2);
      
      // Start background save
      setIsSavingLead(true);
      setError('');
      
      fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          mobile: formData.mobile
        }),
      })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setLeadId(data.id);
        } else {
          // If background save fails, we don't interrupt the user yet, 
          // but we might want to log it or handle it in handleSubmit
          console.error('Background lead save failed');
        }
      })
      .catch(err => console.error('Background save error:', err))
      .finally(() => setIsSavingLead(false));
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.preventDefault();
    if (validateStep2() && validateTurnstile()) {
      setIsSavingLead(true);
      setError('');
      try {
        // If we don't have a leadId for some reason, we fall back to POST
        const method = leadId ? 'PATCH' : 'POST';
        const url = '/api/appointments'; // Always use the public appointments endpoint
        
        const normalizeText = (text: string) => text.replace(/[ \t]+/g, ' ').replace(/\n+/g, '\n').trim();
        const payload = leadId 
          ? { id: leadId, email: formData.email, message: normalizeText(formData.message), turnstileToken: formData.turnstileToken }
          : { ...formData, message: normalizeText(formData.message) };

        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setIsSubmitted(true);
        } else {
          const data = await response.json();
          setError(data.error || 'Submission failed. Please try again.');
        }
      } catch (err) {
        setError('Connection error. Please try again.');
      } finally {
        setIsSavingLead(false);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      
      // Strict constraints
      if (name === 'name' && value.length > 50) return;
      if (name === 'mobile') {
        const numericValue = value.replace(/\D/g, ''); // Numeric only
        if (numericValue.length > 10) return;
        setFormData(prev => ({ ...prev, [name]: numericValue }));
        return;
      }
      if (name === 'email' && value.length > 100) return;
      if (name === 'message' && value.length > 2000) return;

      setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Success Screen Timer Logic
  const [countdown, setCountdown] = useState(10);
  
  React.useEffect(() => {
    if (isSubmitted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isSubmitted && countdown === 0) {
      handleReset();
    }
  }, [isSubmitted, countdown]);

  const handleReset = () => {
    setIsSubmitted(false);
    setStep(1);
    setFormData({ name: '', mobile: '', email: '', message: '', turnstileToken: '' });
    setLeadId(null);
    setCountdown(10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Placeholder for icons handled in imports

  if (isSubmitted) {
    return (
      <div className="p-8 md:p-12 rounded-3xl border shadow-2xl text-center max-w-2xl mx-auto my-24 animate-fadeIn transition-all bg-white border-slate-200">
        <div className="bg-green-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-4xl">🎉</div>
        </div>
        
        <h3 className="text-3xl font-bold mb-3 text-slate-900">{t('appointment.success')}</h3>
        <p className="text-lg mb-8 text-slate-600">{t('appointment.success_msg')}</p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleReset(); }}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all"
          >
            <Home size={20} /> {t('appointment.btn_home')}
          </a>
          <a 
            href="https://www.google.com/maps/dir/?api=1&destination=25.2536,87.0019&destination_place_id=7232%2BCJ+Bhagalpur" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all"
          >
            <MapPin size={20} /> {t('appointment.btn_directions')}
          </a>
          <a 
            href="tel:+918437184452" 
            className="sm:col-span-2 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all"
          >
            <PhoneIcon size={20} /> {t('appointment.btn_call')}
          </a>
        </div>

        {/* Timer Progress */}
        <div className="flex flex-col items-center gap-3 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <RotateCcw size={14} className="animate-spin-slow" />
            {t('appointment.home_timer')} {countdown}s...
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 10) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <section id="appointment" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-200 shadow-xl">
          <div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">{t('appointment.title')}</h2>
            <p className="text-lg text-slate-600">{t('appointment.subtitle')}</p>
            
            <div className="mt-8 flex gap-2">
               <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`} />
               <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
            </div>
          </div>

          <form className="space-y-6">
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">{t('appointment.labels.name')}</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white border-slate-300 text-slate-900 focus:border-primary shadow-sm border-2 rounded-lg p-3 outline-none transition-all duration-300 placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="relative group">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    {t('appointment.labels.mobile')}
                  </label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      className="w-full bg-white border-slate-300 text-slate-900 focus:border-primary shadow-sm border-2 rounded-lg p-3 outline-none transition-all duration-300 placeholder:text-slate-400 pr-10"
                      placeholder="xxxxxxxxxx"
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                    />
                    {formData.mobile.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {formData.mobile.length === 10 ? (
                          <CheckCircle className="text-green-500 w-5 h-5 shadow-sm" />
                        ) : (
                          <XCircle className="text-red-500 w-5 h-5 shadow-sm" />
                        )}
                      </div>
                    )}
                  </div>
                  {formData.mobile.length > 0 && formData.mobile.length < 10 && (
                    <p className="text-[10px] text-red-400 mt-1 font-medium animate-pulse">Need {10 - formData.mobile.length} more digits</p>
                  )}
                </div>
                <button 
                  onClick={handleNext} 
                  className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition"
                >
                  {t('appointment.step1_btn')}
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="relative group">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    {t('appointment.labels.email')}
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-white border-slate-300 text-slate-900 focus:border-primary shadow-sm border-2 rounded-lg p-3 outline-none transition-all duration-300 placeholder:text-slate-400 pr-10"
                    />
                    {formData.email.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? (
                          <CheckCircle className="text-green-500 w-5 h-5" />
                        ) : (
                          <XCircle className="text-red-500 w-5 h-5" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">{t('appointment.labels.message')}</label>
                    <span 
                      className={`text-xs font-medium transition-colors ${
                        formData.message.length >= 2000 ? 'text-red-500 animate-pulse' : 
                        formData.message.length >= 1800 ? 'text-orange-500' : 'text-slate-400'
                      }`}
                    >
                      {formData.message.length}/2000
                    </span>
                  </div>
                  <textarea 
                    rows={3}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full bg-white border-2 rounded-lg p-3 outline-none transition-all duration-300 placeholder:text-slate-400 ${
                      formData.message.length >= 2000 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-slate-300 text-slate-900 focus:border-primary'
                    }`}
                  ></textarea>
                  {formData.message.length >= 2000 && (
                    <p className="text-xs text-red-500 mt-1 font-medium">
                      Maximum character limit reached.
                    </p>
                  )}
                </div>
                
              <div className="flex justify-center my-4">
                  <Turnstile 
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                    onSuccess={(token) => setFormData(prev => ({ ...prev, turnstileToken: token }))}
                    onError={() => setError("Security check failed. Please refresh.")}
                    onExpire={() => setFormData(prev => ({ ...prev, turnstileToken: '' }))}
                  />
              </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={isSavingLead}
                  className="w-full bg-gradient-to-r from-primary to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                >
                  {isSavingLead ? 'Sending...' : t('appointment.step2_btn')}
                </button>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm animate-shake">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
