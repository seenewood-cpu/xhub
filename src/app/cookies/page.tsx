import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'Cookies Policy - V HUB',
};

export default function CookiesPage() {
  return (
    <ContentPage title="Cookies Policy" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>This Cookies Policy explains how V HUB uses cookies and similar technologies when you visit our platform.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">1. What Are Cookies?</h2>
        <p>Cookies are small text files that are stored on your device when you visit a website. They help the platform remember your preferences and improve your browsing experience.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">2. Cookies We Use</h2>
        <p className="font-medium text-[var(--text-primary)]">Essential cookies:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Session cookies</strong> &mdash; Required for the platform to function properly. These are temporary and deleted when you close your browser.</li>
          <li><strong>Authentication cookies</strong> &mdash; Used to maintain your admin session and prevent unauthorized access.</li>
        </ul>
        <p className="font-medium text-[var(--text-primary)] mt-4">Preference cookies:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Theme preference</strong> &mdash; Stored in localStorage to remember your dark/light mode choice. This is not a traditional cookie but serves a similar purpose.</li>
        </ul>
        <p className="font-medium text-[var(--text-primary)] mt-4">Analytics cookies:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Page view tracking</strong> &mdash; We log anonymized page views and search queries to understand usage patterns. This data is tied to your IP address and is used only for aggregate analytics.</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">3. Third-Party Cookies</h2>
        <p>When you watch a video on V HUB, the embedded Google Drive player may set its own cookies. These cookies are governed by Google&apos;s privacy policy, not ours. We do not control third-party cookies.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">4. Managing Cookies</h2>
        <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>View what cookies are stored and delete them individually</li>
          <li>Block third-party cookies</li>
          <li>Block cookies from specific sites</li>
          <li>Block all cookies</li>
          <li>Delete all cookies when you close the browser</li>
        </ul>
        <p>Note: Disabling essential cookies may prevent the platform from functioning correctly.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">5. Changes to This Policy</h2>
        <p>We may update this Cookies Policy periodically. Any changes will be posted on this page with a revised &quot;Last updated&quot; date.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">6. Contact Us</h2>
        <p>If you have questions about our use of cookies, please <a href="/contact" className="text-indigo hover:underline">contact us</a>.</p>
      </div>
    </ContentPage>
  );
}
