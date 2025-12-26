'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const quickReplies = [
  'Track my order',
  'Return policy',
  'Shipping info',
  'Payment methods',
  'Contact support'
];

const botResponses: Record<string, string> = {
  'track my order': 'To track your order, please go to your Account > Orders, or use our Track Order page. You\'ll need your order number and email address.',
  'return policy': 'We offer a 30-day return policy on most items. Products must be unused and in original packaging. Visit our Returns page to start a return.',
  'shipping info': 'We ship nationwide! Standard delivery takes 3-5 business days (R60) and Express is 1-2 days (R120). Free shipping on orders over R500!',
  'payment methods': 'We accept Credit/Debit cards (Visa, Mastercard), Ozow Instant EFT, PayFast, SnapScan, and Manual EFT.',
  'contact support': 'You can reach us at:\n📧 support@jeffy.co.za\n📞 011 123 4567\n⏰ Mon-Fri: 8am-5pm',
  'default': 'I\'m here to help! You can ask me about:\n• Order tracking\n• Returns & refunds\n• Shipping information\n• Payment methods\n\nOr click one of the quick replies below.'
};

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      text: 'Hi there! 👋 Welcome to Jeffy. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate bot typing
    setIsTyping(true);

    setTimeout(() => {
      // Find matching response
      const lowerText = text.toLowerCase();
      let responseText = botResponses['default'];
      
      for (const [key, value] of Object.entries(botResponses)) {
        if (lowerText.includes(key)) {
          responseText = value;
          break;
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-20 right-4 lg:bottom-6 z-40 w-14 h-14 bg-[#ff6b35] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition ${
          isOpen ? 'hidden' : ''
        }`}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 z-50 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border">
          {/* Header */}
          <div className="bg-[#ff6b35] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold">Jeffy Support</h3>
                <p className="text-xs text-white/80">Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  message.type === 'user'
                    ? 'bg-[#ff6b35] text-white rounded-2xl rounded-br-md'
                    : 'bg-gray-100 rounded-2xl rounded-bl-md'
                } px-4 py-2`}>
                  <p className="whitespace-pre-line text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="flex-shrink-0 px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 bg-[#ff6b35] text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Contact Options Widget
export function ContactOptions() {
  return (
    <div className="bg-white rounded-xl border p-6">
      <h3 className="font-bold text-lg mb-4">Need Help?</h3>
      <div className="space-y-4">
        <a href="tel:0111234567" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium">Call Us</p>
            <p className="text-sm text-gray-500">011 123 4567</p>
          </div>
        </a>
        <a href="mailto:support@jeffy.co.za" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Mail className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium">Email Us</p>
            <p className="text-sm text-gray-500">support@jeffy.co.za</p>
          </div>
        </a>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="h-5 w-5 text-[#ff6b35]" />
          </div>
          <div>
            <p className="font-medium">Business Hours</p>
            <p className="text-sm text-gray-500">Mon-Fri: 8am-5pm</p>
          </div>
        </div>
      </div>
    </div>
  );
}
