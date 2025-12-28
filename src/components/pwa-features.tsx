'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Offline detection and notification
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 px-4 py-3 text-center ${
      isOnline ? 'bg-green-500' : 'bg-red-500'
    } text-white`}>
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5" />
            <span>You're back online!</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <span>You're offline. Some features may not work.</span>
          </>
        )}
      </div>
    </div>
  );
}

// PWA Install Prompt
export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Check if we should show the prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShowPrompt(true), 5000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-xl shadow-2xl border p-4 z-40">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-[#ff6b35] rounded-xl flex items-center justify-center flex-shrink-0">
          <Download className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold mb-1">Install Jeffy App</h3>
          <p className="text-sm text-gray-600 mb-3">
            Get a faster experience with our app!
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstall} size="sm">
              Install
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm">
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Service Worker Registration
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content available, show refresh prompt
                  if (confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        },
        (err) => {
          console.error('ServiceWorker registration failed:', err);
        }
      );
    });
  }
}

// Update Available Banner
export function UpdateAvailableBanner() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          setShowUpdate(true);
        });
      });
    }
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-blue-500 text-white rounded-xl p-4 z-40">
      <div className="flex items-center gap-3">
        <RefreshCw className="h-6 w-6" />
        <div className="flex-1">
          <p className="font-medium">Update Available</p>
          <p className="text-sm opacity-90">A new version is ready</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>
    </div>
  );
}

// Cached Page Indicator
export function CachedPageIndicator({ lastUpdated }: { lastUpdated?: Date }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);
    return () => {
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
      <div className="flex items-center gap-2 text-yellow-800">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Viewing cached version</span>
      </div>
      {lastUpdated && (
        <p className="text-xs text-yellow-600 mt-1">
          Last updated: {lastUpdated.toLocaleString()}
        </p>
      )}
    </div>
  );
}

// Add to Home Screen Button (iOS Safari)
export function AddToHomeScreenButton() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);
    
    // Check if already in standalone mode
    const standalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);
  }, []);

  if (!isIOS || isStandalone) return null;

  return (
    <>
      <button
        onClick={() => setShowInstructions(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200"
      >
        <Download className="h-4 w-4" />
        Add to Home Screen
      </button>

      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60">
          <div className="bg-white rounded-t-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">Add to Home Screen</h3>
            <ol className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-xs">1</span>
                Tap the Share button <span className="text-blue-500">↑</span> at the bottom of Safari
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-xs">2</span>
                Scroll down and tap "Add to Home Screen"
              </li>
              <li className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-xs">3</span>
                Tap "Add" to confirm
              </li>
            </ol>
            <Button onClick={() => setShowInstructions(false)} className="w-full mt-6">
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
