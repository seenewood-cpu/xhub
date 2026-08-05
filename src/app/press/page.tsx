import type { Metadata } from 'next';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'Press - V HUB',
};

export default function PressPage() {
  return (
    <ContentPage title="Press" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>Welcome to the V HUB press page. Here you will find information about our platform, brand assets, and media contacts.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">About V HUB</h2>
        <p>V HUB is a modern video discovery platform designed to make browsing and watching videos effortless. Built with a Netflix-inspired interface, V HUB organizes video content into curated categories with seamless search and filtering.</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Key Facts</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Platform:</strong> Web-based video aggregation and discovery</li>
          <li><strong>Technology:</strong> Built with Next.js, React, and Supabase</li>
          <li><strong>Hosting:</strong> Deployed on Vercel with global edge network</li>
          <li><strong>Video Source:</strong> Google Drive embedded playback</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Brand Guidelines</h2>
        <p>When referencing V HUB in media or publications:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Use &quot;V HUB&quot; (with a space) as the official name</li>
          <li>The logo should not be altered, recolored, or modified</li>
          <li>Do not use V HUB branding in a way that implies endorsement</li>
        </ul>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Media Contact</h2>
        <p>For press inquiries, interviews, or media requests, please reach out through our <a href="/contact" className="text-indigo hover:underline">Contact Us</a> page with the subject line &quot;Press Inquiry.&quot;</p>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mt-8 mb-3">Press Kit</h2>
        <p>For official V HUB brand assets and press materials, please contact our media team. We are happy to provide logos, screenshots, and other materials for editorial use.</p>
      </div>
    </ContentPage>
  );
}
