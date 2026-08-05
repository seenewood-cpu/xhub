import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: "Creator's Blog - V HUB",
};

export default function CreatorsBlogPage() {
  return (
    <ContentPage title="Creator's Blog" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>A space for content creators to learn about best practices, tips, and opportunities on V HUB.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Getting Your Content Featured</h2>
        <p>V HUB curates video content from various creators. If you would like your videos to be featured on our platform, here is how the process works:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Host your video on Google Drive with &quot;Anyone with the link&quot; sharing enabled</li>
          <li>Submit the video link along with a title, description, and category through our <a href="/contact" className="text-indigo hover:underline">Contact page</a></li>
          <li>Our team reviews submissions and adds approved content to the platform</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Tips for Creators</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Use clear titles</strong> &mdash; Descriptive titles help viewers find your content through search</li>
          <li><strong>Categorize properly</strong> &mdash; Choosing the right category ensures your video appears in relevant sections</li>
          <li><strong>Write good descriptions</strong> &mdash; Detailed descriptions help viewers understand what to expect</li>
          <li><strong>Keep links active</strong> &mdash; Ensure your Google Drive sharing settings remain public so videos stay playable</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Creator Guidelines</h2>
        <p>All content featured on V HUB must comply with our <a href="/terms" className="text-indigo hover:underline">Terms of Use</a>. Content that is harmful, illegal, or violates copyright will be removed. Please ensure you have the rights to any content you submit.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Upcoming Features</h2>
        <p>We are working on exciting new features for creators, including direct video uploads, analytics dashboards, and channel pages. Stay tuned for updates on our <a href="/blog" className="text-indigo hover:underline">Blog</a>.</p>
      </div>
    </ContentPage>
  );
}
