import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'Privacy Policy - V HUB',
};

export default function PrivacyPage() {
  return (
    <ContentPage title="Privacy Policy" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>Your privacy is important to us. This Privacy Policy explains how V HUB collects, uses, and protects your personal information when you use our platform.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">1. Information We Collect</h2>
        <p className="font-medium text-[var(--text-primary)]">Automatically collected information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>IP address and approximate geographic location</li>
          <li>Browser type, device type, and operating system</li>
          <li>Pages visited, search queries, and time spent on the platform</li>
          <li>Referring website or source</li>
        </ul>
        <p className="font-medium text-[var(--text-primary)] mt-4">Information you provide:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Account details (email address, display name) if you register</li>
          <li>Search queries when you use the search function</li>
          <li>Communications you send to us (e.g., contact forms, support requests)</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide, maintain, and improve our platform and services</li>
          <li>Analyze usage patterns to enhance user experience</li>
          <li>Detect and prevent fraud, abuse, and security threats</li>
          <li>Comply with legal obligations</li>
          <li>Communicate with you about updates, features, or support</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">3. Analytics and Tracking</h2>
        <p>V HUB uses its own analytics system to collect anonymized usage data, including page views, search queries, and visitor counts. This data is stored securely and is used solely for improving the platform. We do not sell this data to third parties.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">4. Cookies</h2>
        <p>We use cookies and similar technologies to remember your preferences (such as dark/light theme), maintain your session, and analyze platform usage. You can control cookie settings through your browser. For more details, see our <a href="/cookies" className="text-indigo hover:underline">Cookies Policy</a>.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">5. Third-Party Services</h2>
        <p>V HUB uses the following third-party services:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Google Drive</strong> &mdash; for video hosting and playback via embedded iframes</li>
          <li><strong>Supabase</strong> &mdash; for database and backend infrastructure</li>
          <li><strong>Vercel</strong> &mdash; for hosting and deployment</li>
        </ul>
        <p>These services have their own privacy policies governing how they handle data. We encourage you to review their policies.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">6. Data Security</h2>
        <p>We implement industry-standard security measures to protect your data, including encryption in transit (HTTPS), secure authentication, and regular security audits. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">7. Data Retention</h2>
        <p>We retain analytics data for up to 12 months. Account information is retained for as long as your account is active. Search query logs are retained for up to 6 months. You may request deletion of your data at any time.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">8. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your personal data</li>
          <li>Object to or restrict certain processing of your data</li>
          <li>Data portability</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">9. Children&apos;s Privacy</h2>
        <p>V HUB is not intended for children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please <a href="/contact" className="text-indigo hover:underline">contact us</a> immediately.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page with a revised &quot;Last updated&quot; date.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">11. Contact Us</h2>
        <p>If you have questions about this Privacy Policy or wish to exercise your data rights, please <a href="/contact" className="text-indigo hover:underline">contact us</a>.</p>
      </div>
    </ContentPage>
  );
}
