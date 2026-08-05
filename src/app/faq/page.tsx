'use client';

import { useState } from 'react';
import ContentPage from '@/components/ContentPage';

const faqs = [
  {
    q: 'What is V HUB?',
    a: 'V HUB is a video discovery and aggregation platform where you can browse, search, and watch videos from various categories. We curate and organize video content hosted on Google Drive for easy access.',
  },
  {
    q: 'Do I need an account to watch videos?',
    a: 'No. V HUB is open to everyone. You can browse and watch videos without creating an account. An account is only required for the admin panel.',
  },
  {
    q: 'How are videos organized?',
    a: 'Videos are organized by categories such as Tutorial, Music, Vlog, and more. You can filter videos by category or use the search bar to find specific content.',
  },
  {
    q: 'Can I upload videos to V HUB?',
    a: 'Currently, video uploads are handled by administrators. If you are a content creator and would like your videos featured on V HUB, please contact us.',
  },
  {
    q: 'Why do videos sometimes fail to load?',
    a: 'Videos are hosted on Google Drive and played via embedded players. Loading issues may occur if the original video link has been removed, the sharing permissions have changed, or there is a temporary Google Drive outage.',
  },
  {
    q: 'Is V HUB free to use?',
    a: 'Yes. V HUB is completely free to browse and watch videos. We may introduce additional features in the future.',
  },
  {
    q: 'How do I report inappropriate content?',
    a: 'If you find content that violates our policies, please use our Content Removal page or Contact Us page to submit a report. We review all reports promptly.',
  },
  {
    q: 'Does V HUB track my activity?',
    a: 'We collect anonymized analytics data such as page views and search queries to improve the platform. For full details, please read our Privacy Policy.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ContentPage title="Frequently Asked Questions" lastUpdated="July 31, 2026">
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-[var(--border)] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-surface)] transition-colors"
            >
              <span className="font-medium text-[var(--text-primary)] pr-4">{faq.q}</span>
              <svg
                className={`w-5 h-5 text-[var(--text-muted)] flex-shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-[var(--text-secondary)] leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
