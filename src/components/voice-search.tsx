'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Search, X, Loader2 } from 'lucide-react';

interface VoiceSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export function VoiceSearch({ onSearch, placeholder = 'Search products...' }: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-ZA'; // South African English

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const text = result[0].transcript;
      
      setTranscript(text);
      
      if (result.isFinal) {
        onSearch(text);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error === 'not-allowed' 
        ? 'Microphone access denied' 
        : 'Voice search failed'
      );
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, [onSearch]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  if (!isSupported) {
    return null; // Don't show voice search if not supported
  }

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`p-3 rounded-full transition ${
          isListening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isListening ? 'Stop listening' : 'Voice search'}
      >
        {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>

      {/* Listening Modal */}
      {isListening && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border p-4 z-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
              <Mic className="h-8 w-8 text-red-500" />
            </div>
            <p className="font-medium mb-1">Listening...</p>
            <p className="text-sm text-gray-500 mb-3">Say what you're looking for</p>
            {transcript && (
              <p className="text-[#ff6b35] font-medium">"{transcript}"</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}

// Voice Search with integrated input
export function VoiceSearchInput({ onSearch, placeholder }: VoiceSearchProps) {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-ZA';

    recognition.onresult = (event: any) => {
      const result = event.results[event.resultIndex];
      setQuery(result[0].transcript);
      
      if (result.isFinal) {
        onSearch(result[0].transcript);
        setIsListening(false);
      }
    };

    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, [onSearch]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setQuery('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-12 pr-24 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ff6b35] ${
          isListening ? 'border-red-500 bg-red-50' : ''
        }`}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-full ${
            isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <Mic className="h-5 w-5" />
        </button>
        <button
          type="submit"
          className="px-4 py-1.5 bg-[#ff6b35] text-white rounded-lg font-medium hover:bg-orange-600"
        >
          Search
        </button>
      </div>
      
      {isListening && (
        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse rounded" />
      )}
    </form>
  );
}
