import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'Terms of Use - V HUB',
};

export default function TermsPage() {
  return (
    <ContentPage title="Terms of Use" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>Welcome to V HUB. By accessing or using our platform, you agree to be bound by these Terms of Use. Please read them carefully before using our services.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">1. Acceptance of Terms</h2>
        <p>By creating an account, browsing, or using any feature of V HUB, you acknowledge that you have read, understood, and agree to comply with these Terms of Use and our Privacy Policy. If you do not agree, please discontinue use of the platform immediately.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">2. Eligibility</h2>
        <p>You must be at least 13 years of age to use V HUB. By using the platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these terms.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">3. Account Registration</h2>
        <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">4. Content Usage</h2>
        <p>All videos and media content on V HUB are hosted via third-party services. V HUB does not host, upload, or distribute video content directly. Users may view and share content through embedded players. You may not download, reproduce, or redistribute content without explicit permission from the content owner.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">5. Prohibited Conduct</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Using the platform for any unlawful purpose</li>
          <li>Attempting to gain unauthorized access to any part of the platform</li>
          <li>Uploading or sharing malicious software or harmful content</li>
          <li>Harassing, threatening, or intimidating other users</li>
          <li>Impersonating any person or entity</li>
          <li>Interfering with the proper functioning of the platform</li>
          <li>Scraping, mining, or harvesting user data without consent</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">6. Intellectual Property</h2>
        <p>The V HUB platform, including its design, code, logos, and branding, is the intellectual property of V HUB and is protected by applicable copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute any part of the platform without prior written consent.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">7. Disclaimers</h2>
        <p>V HUB is provided on an &quot;as is&quot; and &quot;as available&quot; basis. We make no warranties or representations regarding the accuracy, reliability, or availability of the platform. We do not guarantee that the platform will be uninterrupted, error-free, or secure.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">8. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, V HUB shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform. Our total liability shall not exceed the amount you paid us, if any, in the past twelve months.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">9. Modifications to Terms</h2>
        <p>We reserve the right to modify these Terms of Use at any time. Changes will be effective upon posting. Your continued use of the platform after changes are posted constitutes acceptance of the modified terms. We encourage you to review this page periodically.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">10. Governing Law</h2>
        <p>These Terms of Use are governed by and construed in accordance with applicable laws. Any disputes arising from these terms shall be resolved in the appropriate courts of the applicable jurisdiction.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">11. Contact</h2>
        <p>If you have questions about these Terms of Use, please <a href="/contact" className="text-indigo hover:underline">contact us</a>.</p>
      </div>
    </ContentPage>
  );
}
