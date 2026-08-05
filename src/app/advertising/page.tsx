import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'Advertising - V HUB',
};

export default function AdvertisingPage() {
  return (
    <ContentPage title="Advertising" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>Partner with V HUB to reach a growing audience of video enthusiasts. We offer advertising opportunities for brands, creators, and businesses looking to connect with our community.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Why Advertise on V HUB?</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Engaged audience</strong> &mdash; Our users come to V HUB specifically to discover and watch video content</li>
          <li><strong>Targeted placement</strong> &mdash; Ads can be placed alongside relevant categories and content</li>
          <li><strong>Clean interface</strong> &mdash; Your brand appears in a modern, distraction-free environment</li>
          <li><strong>Growing platform</strong> &mdash; Be part of a rising video discovery platform</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Advertising Options</h2>
        <div className="space-y-4">
          <div className="p-4 border border-[var(--border)] rounded-xl">
            <h3 className="font-bold text-[var(--text-primary)] mb-1">Sponsored Content</h3>
            <p className="text-sm">Feature your video or brand as a highlighted item within our category rails.</p>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-xl">
            <h3 className="font-bold text-[var(--text-primary)] mb-1">Category Sponsorship</h3>
            <p className="text-sm">Sponsor an entire category with your branding prominently displayed.</p>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-xl">
            <h3 className="font-bold text-[var(--text-primary)] mb-1">Homepage Placement</h3>
            <p className="text-sm">Get featured on the V HUB homepage for maximum visibility.</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Get Started</h2>
        <p>To discuss advertising opportunities, please <a href="/contact" className="text-indigo hover:underline">contact us</a> with the subject line &quot;Advertising Inquiry&quot; and include details about your brand and goals.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Ad Policy</h2>
        <p>We reserve the right to reject any advertising content that:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Violates our Terms of Use or applicable laws</li>
          <li>Is misleading, deceptive, or fraudulent</li>
          <li>Contains harmful, offensive, or inappropriate material</li>
          <li>Promotes illegal products or services</li>
        </ul>
      </div>
    </ContentPage>
  );
}
