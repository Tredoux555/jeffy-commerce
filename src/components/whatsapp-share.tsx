'use client';

import { MessageCircle } from 'lucide-react';

interface WhatsAppShareProps {
  orderNumber: string;
  productNames?: string[];
  variant?: 'button' | 'icon';
  className?: string;
}

export function WhatsAppOrderShare({ orderNumber, productNames = [], variant = 'button', className = '' }: WhatsAppShareProps) {
  const phoneNumber = '27123456789'; // Replace with actual Jeffy support number
  
  const message = encodeURIComponent(
    `Hi Jeffy! 👋\n\nI just placed order #${orderNumber}.\n${productNames.length > 0 ? `\nProducts: ${productNames.slice(0, 3).join(', ')}${productNames.length > 3 ? '...' : ''}` : ''}\n\nPlease confirm my order. Thanks!`
  );
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  if (variant === 'icon') {
    return (
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600 transition ${className}`}
      >
        <MessageCircle className="h-5 w-5" />
      </a>
    );
  }

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-medium ${className}`}
    >
      <MessageCircle className="h-5 w-5" />
      Chat on WhatsApp
    </a>
  );
}

// General WhatsApp support button
export function WhatsAppSupport({ className = '' }: { className?: string }) {
  const phoneNumber = '27123456789';
  const message = encodeURIComponent('Hi Jeffy! I have a question.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a 
      href={whatsappUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:bg-green-600 transition ${className}`}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden sm:inline font-medium">Need Help?</span>
    </a>
  );
}
