'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CONSENT_KEY = 'jeffy-cookie-consent';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be changed
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Show banner after short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      ...prefs,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
    
    // Trigger analytics if accepted
    if (prefs.analytics && typeof window !== 'undefined') {
      // Initialize analytics here
      console.log('Analytics enabled');
    }
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptSelected = () => {
    saveConsent(preferences);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border overflow-hidden">
        {!showDetails ? (
          // Simple Banner
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Cookie className="h-6 w-6 text-[#ff6b35]" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">We use cookies 🍪</h3>
                <p className="text-gray-600 text-sm mb-4">
                  We use cookies to improve your experience, analyze site traffic, and personalize content. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={acceptAll}>
                    Accept All
                  </Button>
                  <Button variant="outline" onClick={rejectAll}>
                    Reject All
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowDetails(true)}
                    className="text-gray-600"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Preferences
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Detailed Preferences
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Cookie Preferences</h3>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Strictly Necessary</h4>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Always Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Essential for the website to function. Cannot be disabled.
                  </p>
                </div>
                <div className="w-12 h-6 bg-[#ff6b35] rounded-full flex items-center justify-end px-1">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>

              {/* Analytics */}
              <CookieToggle
                title="Analytics Cookies"
                description="Help us understand how visitors interact with our website."
                checked={preferences.analytics}
                onChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
              />

              {/* Marketing */}
              <CookieToggle
                title="Marketing Cookies"
                description="Used to deliver personalized ads and track ad campaign performance."
                checked={preferences.marketing}
                onChange={(checked) => setPreferences({ ...preferences, marketing: checked })}
              />

              {/* Preferences */}
              <CookieToggle
                title="Preference Cookies"
                description="Remember your settings and preferences for a better experience."
                checked={preferences.preferences}
                onChange={(checked) => setPreferences({ ...preferences, preferences: checked })}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-4 border-t">
              <Button onClick={acceptSelected}>
                Save Preferences
              </Button>
              <Button variant="outline" onClick={acceptAll}>
                Accept All
              </Button>
              <Link href="/privacy" className="text-sm text-gray-500 hover:underline self-center ml-auto">
                Privacy Policy
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Toggle Component
function CookieToggle({ 
  title, 
  description, 
  checked, 
  onChange 
}: { 
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 border rounded-lg">
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
          checked ? 'bg-[#ff6b35]' : 'bg-gray-300'
        }`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}

// Utility to check consent
export function hasConsent(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem(CONSENT_KEY);
  if (!consent) return false;
  
  try {
    const prefs = JSON.parse(consent);
    return !!prefs[type];
  } catch {
    return false;
  }
}

// Cookie Settings Button (for footer)
export function CookieSettingsButton() {
  const handleClick = () => {
    localStorage.removeItem(CONSENT_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={handleClick}
      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
    >
      <Cookie className="h-4 w-4" />
      Cookie Settings
    </button>
  );
}
