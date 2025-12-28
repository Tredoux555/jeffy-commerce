'use client';

import { useState, useEffect } from 'react';
import { Eye, Type, Moon, Sun, ZoomIn, ZoomOut, RotateCcw, Contrast, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  darkMode: boolean;
  lineHeight: number;
  letterSpacing: number;
}

const defaultSettings: AccessibilitySettings = {
  fontSize: 100,
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  darkMode: false,
  lineHeight: 1.5,
  letterSpacing: 0
};

const STORAGE_KEY = 'jeffy-accessibility';

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // Font size
    root.style.fontSize = `${newSettings.fontSize}%`;
    
    // High contrast
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Dark mode
    if (newSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Line height
    root.style.setProperty('--line-height', String(newSettings.lineHeight));
    
    // Letter spacing
    root.style.setProperty('--letter-spacing', `${newSettings.letterSpacing}em`);
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem(STORAGE_KEY);
    applySettings(defaultSettings);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 p-3 bg-[#ff6b35] text-white rounded-full shadow-lg hover:bg-orange-600 transition"
        aria-label="Accessibility Options"
      >
        <Eye className="h-6 w-6" />
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 md:bottom-auto md:left-4 md:top-1/2 md:-translate-y-1/2 md:right-auto md:w-80 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl z-50 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Font Size */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Type className="h-4 w-4" />
                  Text Size
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateSetting('fontSize', Math.max(80, settings.fontSize - 10))}
                    className="p-2 border rounded hover:bg-gray-100"
                    aria-label="Decrease text size"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-center font-medium">{settings.fontSize}%</span>
                  <button
                    onClick={() => updateSetting('fontSize', Math.min(150, settings.fontSize + 10))}
                    className="p-2 border rounded hover:bg-gray-100"
                    aria-label="Increase text size"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Contrast className="h-4 w-4" />
                  High Contrast
                </label>
                <Toggle
                  checked={settings.highContrast}
                  onChange={(v) => updateSetting('highContrast', v)}
                />
              </div>

              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  {settings.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  Dark Mode
                </label>
                <Toggle
                  checked={settings.darkMode}
                  onChange={(v) => updateSetting('darkMode', v)}
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <RotateCcw className="h-4 w-4" />
                  Reduce Motion
                </label>
                <Toggle
                  checked={settings.reducedMotion}
                  onChange={(v) => updateSetting('reducedMotion', v)}
                />
              </div>

              {/* Line Height */}
              <div>
                <label className="text-sm font-medium mb-2 block">Line Spacing</label>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => updateSetting('lineHeight', parseFloat(e.target.value))}
                  className="w-full accent-[#ff6b35]"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tight</span>
                  <span>Normal</span>
                  <span>Loose</span>
                </div>
              </div>

              {/* Letter Spacing */}
              <div>
                <label className="text-sm font-medium mb-2 block">Letter Spacing</label>
                <input
                  type="range"
                  min="0"
                  max="0.15"
                  step="0.01"
                  value={settings.letterSpacing}
                  onChange={(e) => updateSetting('letterSpacing', parseFloat(e.target.value))}
                  className="w-full accent-[#ff6b35]"
                />
              </div>

              {/* Reset */}
              <Button variant="outline" onClick={resetSettings} className="w-full">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Toggle component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-[#ff6b35]' : 'bg-gray-300'
      }`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-0.5'
      }`} />
    </button>
  );
}

// Skip to content link
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#ff6b35] focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  );
}

// Screen reader only text
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Focus trap for modals
export function useFocusTrap(isActive: boolean) {
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Handle escape key
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);
}
