'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'agent';
  content: string;
  timestamp: Date;
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    question: "What are your shipping times?",
    answer: "Standard delivery takes 3-5 business days. Express delivery is 1-2 business days. Free shipping on orders over R500!",
    keywords: ['shipping', 'delivery', 'days', 'time', 'how long']
  },
  {
    question: "How do I track my order?",
    answer: "You can track your order by clicking 'Track Order' in your account or using the tracking link sent to your email.",
    keywords: ['track', 'tracking', 'order', 'where', 'status']
  },
  {
    question: "What is your return policy?",
    answer: "We offer 30-day returns for unused items in original packaging. Contact us to initiate a return.",
    keywords: ['return', 'refund', 'money back', 'exchange']
  },
  {
    question: "How can I contact customer service?",
    answer: "You can reach us via WhatsApp at +27 xx xxx xxxx, email at support@jeffy.co.za, or call during business hours.",
    keywords: ['contact', 'support', 'help', 'phone', 'email']
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept credit/debit cards (Visa, Mastercard), Ozow instant EFT, SnapScan, Zapper, and Cash on Delivery.",
    keywords: ['payment', 'pay', 'card', 'eft', 'methods']
  }
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initial greeting
      addBotMessage("Hi! 👋 I'm Jeffy's virtual assistant. How can I help you today?");
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBotMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'bot',
      content,
      timestamp: new Date()
    }]);
  };

  const findAnswer = (query: string): string | null => {
    const lowerQuery = query.toLowerCase();
    
    for (const faq of faqs) {
      if (faq.keywords.some(kw => lowerQuery.includes(kw))) {
        return faq.answer;
      }
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    setIsTyping(true);
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const answer = findAnswer(userMessage);
    
    if (answer) {
      addBotMessage(answer);
    } else {
      addBotMessage("I'm not sure about that. Would you like to speak to a human agent? Click 'Contact Us' below.");
    }
    
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-40 p-4 bg-[#ff6b35] text-white rounded-full shadow-lg hover:bg-orange-600 transition ${
          isOpen ? 'hidden' : ''
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border overflow-hidden flex flex-col max-h-[500px]">
          {/* Header */}
          <div className="bg-[#ff6b35] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold">Jeffy Support</h3>
                <p className="text-xs text-white/80">Usually replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="p-4 border-b bg-gray-50">
              <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {faqs.slice(0, 3).map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(faq.question);
                      handleSend();
                    }}
                    className="text-xs px-3 py-1.5 bg-white border rounded-full hover:bg-gray-100"
                  >
                    {faq.question.split(' ').slice(0, 4).join(' ')}...
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.type === 'user'
                    ? 'bg-[#ff6b35] text-white rounded-br-none'
                    : 'bg-gray-100 text-gray-900 rounded-bl-none'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">Typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Contact Form */}
          {showContactForm && (
            <div className="p-4 border-t bg-gray-50">
              <ContactForm onClose={() => setShowContactForm(false)} />
            </div>
          )}

          {/* Input */}
          {!showContactForm && (
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-2 bg-[#ff6b35] text-white rounded-full hover:bg-orange-600 disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="flex justify-center gap-4 mt-3">
                <button
                  onClick={() => setShowContactForm(true)}
                  className="text-xs text-gray-500 hover:text-[#ff6b35] flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Contact Us
                </button>
                <a
                  href="https://wa.me/27000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-green-600 flex items-center gap-1"
                >
                  <Phone className="h-3 w-3" />
                  WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

// Contact Form Component
function ContactForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="font-medium">Message Sent!</p>
        <p className="text-sm text-gray-500">We'll get back to you soon.</p>
        <Button onClick={onClose} variant="ghost" size="sm" className="mt-3">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Your name"
        className="w-full px-3 py-2 border rounded-lg text-sm"
        required
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Your email"
        className="w-full px-3 py-2 border rounded-lg text-sm"
        required
      />
      <textarea
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        placeholder="How can we help?"
        rows={3}
        className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
        required
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={loading} className="flex-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Send
        </Button>
      </div>
    </form>
  );
}

// Business Hours Indicator
export function BusinessHoursIndicator() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkHours = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();
      
      // Monday-Friday 8am-6pm, Saturday 9am-2pm
      if (day >= 1 && day <= 5) {
        setIsOpen(hour >= 8 && hour < 18);
      } else if (day === 6) {
        setIsOpen(hour >= 9 && hour < 14);
      } else {
        setIsOpen(false);
      }
    };

    checkHours();
    const interval = setInterval(checkHours, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 text-sm ${isOpen ? 'text-green-600' : 'text-gray-500'}`}>
      <Clock className="h-4 w-4" />
      <span>{isOpen ? 'We\'re online' : 'Currently offline'}</span>
      {!isOpen && <span className="text-xs">• Mon-Fri 8am-6pm</span>}
    </div>
  );
}
