'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, MinusCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'agent';
  timestamp: Date;
}

const QUICK_REPLIES = [
  'Track my order',
  'Return policy',
  'Shipping info',
  'Contact support',
];

const AUTO_REPLIES: Record<string, string> = {
  'track my order': 'To track your order, please go to our Track Order page (/track) and enter your order number and phone number. You\'ll see real-time updates on your delivery!',
  'return policy': 'We offer a 14-day return policy on most items. Products must be unused and in original packaging. Contact us at hello@jeffy.co.za to initiate a return.',
  'shipping info': 'We deliver across South Africa through our Zone Partner network. Standard delivery takes 2-4 weeks. Local Zone Partner delivery is usually 1-3 days once the product arrives.',
  'contact support': 'You can reach us via:\n• WhatsApp: +27 12 345 6789\n• Email: hello@jeffy.co.za\n• Or continue chatting here!',
  'default': 'Thanks for your message! Our team will respond shortly. In the meantime, you can check our FAQ page for quick answers.',
};

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! 👋 Welcome to Jeffy. How can I help you today?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    // Simulate response delay
    await new Promise(r => setTimeout(r, 1000 + Math.random() * 1000));

    // Find matching auto-reply
    let replyText = AUTO_REPLIES.default;
    for (const [key, value] of Object.entries(AUTO_REPLIES)) {
      if (userInput.includes(key)) {
        replyText = value;
        break;
      }
    }

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: replyText,
      sender: 'bot',
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMessage]);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
    setTimeout(handleSend, 100);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#ff6b35] text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-all hover:scale-110"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
      {/* Header */}
      <div className="bg-[#ff6b35] text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold">Jeffy Support</h3>
            <p className="text-xs text-white/80">Usually replies instantly</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMinimized(!isMinimized)} className="hover:bg-white/20 p-1 rounded">
            <MinusCircle className="h-5 w-5" />
          </button>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[340px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                  {msg.sender !== 'user' && (
                    <div className="w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center mb-1">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={`p-3 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-[#ff6b35] text-white rounded-br-md' 
                      : 'bg-white border rounded-bl-md'
                  }`}>
                    <p className="text-sm whitespace-pre-line">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-[#ff6b35] rounded-full flex items-center justify-center">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <div className="bg-white border p-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="flex-shrink-0 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-[#ff6b35] text-white p-2 rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
