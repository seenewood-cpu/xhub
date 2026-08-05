'use client';

import Link from 'next/link';

const footerLinks = {
  vHub: [
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
    { label: "Creator's Blog", href: '/creators-blog' },
    { label: 'Advertising', href: '/advertising' },
  ],
  help: [
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact us', href: '/contact' },
    { label: 'Content Removal', href: '/content-removal' },
  ],
  legal: [
    { label: 'Terms of use', href: '/terms' },
    { label: 'Privacy policy', href: '/privacy' },
    { label: 'Cookies policy', href: '/cookies' },
    { label: 'DMCA/Copyright', href: '/dmca' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--bg-card)]/50 backdrop-blur-sm">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo to-cyber rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-abyss" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold gradient-text-static">V HUB</span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Your destination for watching, sharing, and discovering videos.
            </p>
          </div>

          {/* vHub Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">vHub</h3>
            <ul className="space-y-2.5">
              {footerLinks.vHub.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-indigo transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Help</h3>
            <ul className="space-y-2.5">
              {footerLinks.help.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-indigo transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-indigo transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} V HUB. All rights reserved.
          </p>
          <p className="text-xs text-[var(--text-muted)]">
            Built with passion for video content
          </p>
        </div>
      </div>
    </footer>
  );
}
