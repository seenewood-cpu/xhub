'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const choose = (value: 'allowed' | 'declined') => {
    localStorage.setItem(STORAGE_KEY, value);
    document.cookie = `cookie_consent=${value}; path=/; max-age=31536000; samesite=lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 glass-header scrolled border-t border-[var(--border)]"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="flex-1 text-sm text-[var(--text-secondary)]">
          We use cookies to store your preferences and improve your viewing experience.
          By clicking &quot;Allow Cookies&quot;, you consent to the use of cookies on this site.
        </p>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => choose('allowed')} className="btn-primary text-sm py-2 px-5">
            Allow Cookies
          </button>
          <button onClick={() => choose('declined')} className="btn-secondary text-sm py-2 px-5">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
