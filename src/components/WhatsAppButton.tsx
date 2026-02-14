import Image from 'next/image';
import whatsappIcon from '../assets/whatsapp-3d.svg';

export default function WhatsAppButton() {
  const phoneNumber = "919955868599"; // Updated to the actual number provided
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 transition-transform duration-300 hover:scale-110 group animate-bounce"
      title="Chat on WhatsApp"
      style={{ animationDuration: '2s' }}
    >
      <div className="w-16 h-16 drop-shadow-2xl">
        <Image 
          src={whatsappIcon} 
          alt="WhatsApp" 
          width={64} 
          height={64} 
          className="w-full h-full object-contain"
        />
      </div>
      
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 border-8 border-transparent border-l-white"></div>
      </span>
    </a>
  );
}
