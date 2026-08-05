import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'Content Removal - V HUB',
};

export default function ContentRemovalPage() {
  return (
    <ContentPage title="Content Removal Request" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>V HUB takes content removal requests seriously. If you believe that content available through our platform should be removed, please follow the process below.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Before You Submit</h2>
        <p>Please note that V HUB does not host video content directly. All videos are embedded from Google Drive. Removing content from V HUB does not remove it from Google Drive. You may also need to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Change the sharing permissions of the video on Google Drive</li>
          <li>Delete the video from Google Drive entirely</li>
          <li>File a DMCA request with Google if the content infringes your copyright</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Grounds for Removal</h2>
        <p>We may remove content from V HUB for the following reasons:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Copyright or intellectual property infringement</li>
          <li>Content that violates applicable laws</li>
          <li>Content that is harmful, abusive, or violates our Terms of Use</li>
          <li>Content that contains personal or private information without consent</li>
          <li>Content that you uploaded and wish to have removed</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">How to Submit a Request</h2>
        <p>Please use our <a href="/contact" className="text-indigo hover:underline">Contact Us</a> page and include the following information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Your name and contact information</li>
          <li>The title or URL of the video you want removed</li>
          <li>The reason for the removal request</li>
          <li>Proof of ownership or authorization (if applicable)</li>
          <li>A statement that you believe the content should be removed in good faith</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Processing Time</h2>
        <p>We aim to review all content removal requests within 3-5 business days. Urgent requests related to legal compliance will be prioritized.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Copyright-Specific Requests</h2>
        <p>If your request is related to copyright infringement, please refer to our <a href="/dmca" className="text-indigo hover:underline">DMCA/Copyright Policy</a> for the formal takedown process.</p>
      </div>
    </ContentPage>
  );
}
