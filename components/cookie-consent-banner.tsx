'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, Sliders } from 'lucide-react';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytics: boolean; // PostHog / usage telemetry
  marketing: boolean; // Optional marketing pixels
  timestamp: string;
}

const STORAGE_KEY = 'memelaunch_cookie_consent';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: true,
    marketing: false,
    timestamp: '',
  });

  useEffect(() => {
    // Read saved preferences from localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setPreferences(JSON.parse(saved));
      } else {
        // Show banner after short delay if no preference set
        const timer = setTimeout(() => setShowBanner(true), 800);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      setShowBanner(true);
    }

    // Expose global opener function for Privacy/Footer trigger
    (window as any).openCookieConsentModal = () => {
      setShowModal(true);
    };
  }, []);

  const saveConsent = (newPrefs: CookiePreferences) => {
    const updated = {
      ...newPrefs,
      essential: true,
      timestamp: new Date().toISOString(),
    };
    setPreferences(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      document.cookie = `memelaunch_cookie_consent=true; max-age=31536000; path=/; SameSite=Lax`;
    } catch (e) {
      console.error('Failed to save cookie consent', e);
    }
    setShowBanner(false);
    setShowModal(false);

    // Notify window listeners (e.g. PostHog provider)
    window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: updated }));
  };

  const handleAcceptAll = () => {
    saveConsent({
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    });
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {/* Floating Bottom Banner */}
      {showBanner && !showModal && (
        <div
          id="cookie-consent-banner"
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 bg-zinc-950 border-4 border-black p-5 rounded-2xl shadow-brutal animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#ffe600] text-zinc-950 rounded-xl border-2 border-black shadow-brutal-sm shrink-0 mt-0.5">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-heading text-sm font-black uppercase text-zinc-50 tracking-wide">
                  Cookie & Privacy Preferences
                </h4>
                <button
                  id="cookie-banner-close-btn"
                  onClick={handleRejectNonEssential}
                  className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-zinc-300 font-medium leading-relaxed">
                We use essential cookies for authentication and performance telemetry to improve MemeLaunch. You can customize your consent settings at any time.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  id="cookie-accept-all-btn"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 bg-[#ffe600] text-zinc-950 border-2 border-black rounded-xl text-xs font-black uppercase shadow-brutal-sm hover:bg-yellow-400 transition-all"
                >
                  Accept All
                </button>
                <button
                  id="cookie-essential-only-btn"
                  onClick={handleRejectNonEssential}
                  className="px-3.5 py-1.5 bg-zinc-900 text-zinc-200 border-2 border-black rounded-xl text-xs font-black uppercase hover:bg-zinc-800 transition-all"
                >
                  Essential Only
                </button>
                <button
                  id="cookie-customize-btn"
                  onClick={() => setShowModal(true)}
                  className="px-3 py-1.5 bg-zinc-900 text-cyan-400 border-2 border-black rounded-xl text-xs font-bold uppercase hover:bg-zinc-800 transition-all flex items-center gap-1 ml-auto"
                >
                  <Sliders className="h-3.5 w-3.5" /> Customize
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Modal */}
      {showModal && (
        <div
          id="cookie-preferences-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-zinc-950 border-4 border-black rounded-3xl p-6 max-w-lg w-full shadow-brutal space-y-6 text-zinc-200">
            <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-400 text-zinc-950 rounded-xl border-2 border-black shadow-brutal-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-black uppercase text-zinc-50">
                    Cookie Settings
                  </h3>
                  <p className="text-xs text-zinc-400">Manage your data preferences on MemeLaunch</p>
                </div>
              </div>
              <button
                id="cookie-modal-close-btn"
                onClick={() => setShowModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border-2 border-black rounded-xl hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Category 1: Essential */}
              <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-zinc-100 flex items-center gap-1.5">
                    Essential Cookies <span className="text-[10px] bg-cyan-400 text-zinc-950 px-1.5 py-0.5 rounded font-black">ALWAYS ACTIVE</span>
                  </span>
                  <input type="checkbox" checked disabled className="h-4 w-4 rounded accent-cyan-400 cursor-not-allowed" />
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Required for user login sessions, security tokens, and preserving your active points balance. Cannot be disabled.
                </p>
              </div>

              {/* Category 2: Analytics */}
              <div className="p-4 bg-zinc-900 border-2 border-black rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase text-zinc-100">
                    Analytics & Performance (PostHog)
                  </span>
                  <input
                    id="cookie-toggle-analytics"
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="h-4 w-4 rounded accent-[#ffe600] cursor-pointer"
                  />
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Allows us to measure website traffic, error rates, and popular meme launches to optimize site responsiveness.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t-2 border-zinc-800">
              <button
                id="cookie-modal-save-btn"
                onClick={() => saveConsent(preferences)}
                className="w-full py-2.5 bg-[#ffe600] text-zinc-950 border-2 border-black rounded-xl font-black text-xs uppercase shadow-brutal-sm hover:bg-yellow-400 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" /> Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
