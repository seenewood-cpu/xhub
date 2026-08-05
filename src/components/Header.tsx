'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 glass-header ${scrolled ? 'scrolled' : ''}`}
      role="banner"
    >
      <nav className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12" aria-label="Main navigation">
        <div className="flex justify-between h-16 items-center">
          <Link
            href={pathname.startsWith('/admin') ? '/admin' : '/'}
            className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-indigo rounded-lg p-1"
            aria-label="Video Hub Home"
          >
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo to-cyber rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <svg className="w-5 h-5 text-abyss" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo to-cyber rounded-xl opacity-0 group-hover:opacity-30 blur-md transition-all duration-300" />
            </div>
            <span className="text-xl font-bold gradient-text-static hidden sm:block">
              V HUB
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 bg-indigo/15 text-indigo border border-indigo/30 focus:outline-none focus:ring-2 focus:ring-accent hidden sm:inline-flex"
            >
              Gallery
            </Link>
            <button
              onClick={toggle}
              className="p-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
