import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'DMCA/Copyright - V HUB',
};

export default function DMCAPage() {
  return (
    <ContentPage title="DMCA / Copyright Policy" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>V HUB respects the intellectual property rights of others and expects the same from our users. We comply with the Digital Millennium Copyright Act (DMCA) and respond promptly to valid takedown requests.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">1. Our Role</h2>
        <p>V HUB is a video discovery and aggregation platform. We do not host, upload, or store video content directly. All videos are embedded via Google Drive iframes. As such, V HUB does not have direct control over the content hosted on third-party services.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">2. Reporting Copyright Infringement</h2>
        <p>If you believe that content accessible through V HUB infringes your copyright, please submit a written notification containing the following information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>A physical or electronic signature of the copyright owner or authorized agent</li>
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>Identification of the allegedly infringing material and its location on V HUB (video URL or title)</li>
          <li>Your contact information (name, address, phone number, email)</li>
          <li>A statement that you have a good faith belief that the use is not authorized</li>
          <li>A statement, under penalty of perjury, that the information in the notice is accurate and you are authorized to act on behalf of the copyright owner</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">3. How to Submit a Takedown Request</h2>
        <p>Send your DMCA notice to our designated copyright agent via <a href="/contact" className="text-indigo hover:underline">our contact page</a> with the subject line &quot;DMCA Takedown Request.&quot;</p>
        <p>We will review your request and take appropriate action, which may include removing or disabling access to the allegedly infringing content.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">4. Counter-Notification</h2>
        <p>If you believe your content was removed in error, you may submit a counter-notification containing:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Your physical or electronic signature</li>
          <li>Identification of the material that was removed and its previous location</li>
          <li>A statement under penalty of perjury that the removal was a mistake</li>
          <li>Your consent to the jurisdiction of the applicable court</li>
          <li>Your contact information</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">5. Repeat Infringers</h2>
        <p>V HUB may terminate the accounts of users who are found to be repeat copyright infringers, in accordance with the DMCA and applicable law.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">6. Good Faith Notices</h2>
        <p>Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material is infringing may be subject to liability for damages.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">7. Contact</h2>
        <p>For all copyright-related inquiries, please <a href="/contact" className="text-indigo hover:underline">contact us</a>.</p>
      </div>
    </ContentPage>
  );
}
