import Link from 'next/link';

interface ContentPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function ContentPage({ title, lastUpdated, children }: ContentPageProps) {
  return (
    <div className="min-h-screen animated-gradient-bg">
      <div className="aurora-container">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-12 py-24 pb-32">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-indigo hover:text-indigo/80 mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3">{title}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-10">Last updated: {lastUpdated}</p>
        <div className="glass-card-strong p-8 sm:p-10 prose-custom">
          {children}
        </div>
      </div>
    </div>
  );
}
