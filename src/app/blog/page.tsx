import type { Metadata } from 'next';
import Link from 'next/link';
import ContentPage from '@/components/ContentPage';

export const metadata: Metadata = {
  title: 'Blog - V HUB',
};

const posts = [
  {
    slug: 'welcome-to-vhub',
    title: 'Welcome to V HUB',
    date: 'July 31, 2026',
    excerpt: 'Introducing V HUB, your new destination for discovering and watching curated video content with a seamless browsing experience.',
  },
  {
    slug: 'how-to-find-videos',
    title: 'How to Find the Perfect Video',
    date: 'July 31, 2026',
    excerpt: 'Learn how to use categories, search, and filters to quickly find the content you are looking for on V HUB.',
  },
  {
    slug: 'dark-mode-guide',
    title: 'Everything About Dark Mode on V HUB',
    date: 'July 31, 2026',
    excerpt: 'V HUB supports both dark and light themes. Here is how to toggle between them and customize your viewing experience.',
  },
];

export default function BlogPage() {
  return (
    <ContentPage title="Blog" lastUpdated="July 31, 2026">
      <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
        <p>News, updates, and guides from the V HUB team.</p>

        <div className="space-y-6 mt-8">
          {posts.map((post) => (
            <div key={post.slug} className="p-5 border border-[var(--border)] rounded-xl hover:border-indigo/30 transition-colors">
              <p className="text-xs text-[var(--text-muted)] mb-2">{post.date}</p>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{post.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{post.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </ContentPage>
  );
}
