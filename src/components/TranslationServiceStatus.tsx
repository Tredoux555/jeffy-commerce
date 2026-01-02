'use client';

/**
 * Translation Service Status Component
 * 
 * Shows whether translation services are configured and available.
 */

import { useState, useEffect } from 'react';

interface ServiceStatus {
  available: boolean;
  services: {
    alibaba: boolean;
    claude: boolean;
  };
  recommended: 'alibaba' | 'claude' | null;
  description: string;
  pricing: {
    alibaba: { perImage: string; per1000: string } | null;
    claude: { perImage: string; per1000: string } | null;
  };
  configurationNeeded: string[];
}

export function TranslationServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch('/api/translate-images/service-status');
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to check status');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-100 rounded-lg p-3">
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
        ⚠️ Unable to check translation service status
      </div>
    );
  }

  if (!status.available) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-medium text-yellow-800">Translation Service Not Configured</h4>
            <p className="text-sm text-yellow-700 mt-1">
              To enable image translation, add one of these environment variables:
            </p>
            <ul className="mt-2 text-sm text-yellow-600 space-y-1">
              <li className="font-mono bg-yellow-100 px-2 py-1 rounded inline-block">
                ALIBABA_DASHSCOPE_API_KEY
              </li>
              <li className="text-xs text-yellow-500">or</li>
              <li className="font-mono bg-yellow-100 px-2 py-1 rounded inline-block">
                ANTHROPIC_API_KEY
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-green-50 border border-green-200 rounded-lg overflow-hidden cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-green-800">
            Translation Ready
          </span>
          <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
            {status.recommended === 'alibaba' ? '🇨🇳 Alibaba Qwen' : '🤖 Claude Vision'}
          </span>
        </div>
        <svg 
          className={`w-4 h-4 text-green-600 transition-transform ${expanded ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {expanded && (
        <div className="px-3 pb-3 border-t border-green-200 pt-3">
          <p className="text-sm text-green-700 mb-3">{status.description}</p>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            {/* Alibaba Status */}
            <div className={`p-2 rounded ${status.services.alibaba ? 'bg-green-100' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-1 mb-1">
                {status.services.alibaba ? '✅' : '⚪'}
                <span className="font-medium">Alibaba Qwen-MT</span>
              </div>
              {status.services.alibaba && status.pricing.alibaba && (
                <div className="text-xs text-green-600">
                  {status.pricing.alibaba.perImage}/image
                </div>
              )}
            </div>
            
            {/* Claude Status */}
            <div className={`p-2 rounded ${status.services.claude ? 'bg-green-100' : 'bg-gray-100'}`}>
              <div className="flex items-center gap-1 mb-1">
                {status.services.claude ? '✅' : '⚪'}
                <span className="font-medium">Claude Vision</span>
              </div>
              {status.services.claude && status.pricing.claude && (
                <div className="text-xs text-green-600">
                  {status.pricing.claude.perImage}/image
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

