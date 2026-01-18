import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import Hero from "@/components/Hero";

// Lazy load below-the-fold components
const Services = dynamic(() => import("@/components/Services"), { 
  loading: () => <div className="h-96 animate-pulse bg-slate-50" /> 
});
const About = dynamic(() => import("@/components/About"), { 
  loading: () => <div className="h-96 animate-pulse bg-slate-100" /> 
});
const AppointmentForm = dynamic(() => import("@/components/AppointmentForm"), { 
  loading: () => <div className="h-96 animate-pulse bg-white" /> 
});
const Footer = dynamic(() => import("@/components/Footer"));

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Services />
        <About />
        <AppointmentForm />
      </main>
      <Footer />
    </div>
  );
}
