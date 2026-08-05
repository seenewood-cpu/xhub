'use client';

import { useState, useEffect, useCallback } from 'react';
import VideoCard from '@/components/VideoCard';
import HeroGraphic from '@/components/HeroGraphic';
import { Video } from '@/types/video';

interface PaginatedResponse {
  data: Video[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const CATEGORY_PAGE_SIZE = 50;

export default function GalleryPage() {
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const [categoryVideos, setCategoryVideos] = useState<Record<string, Video[]>>({});
  const [categoryPages, setCategoryPages] = useState<Record<string, number>>({});
  const [categoryTotalPages, setCategoryTotalPages] = useState<Record<string, number>>({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const [searchResults, setSearchResults] = useState<Video[]>([]);

  useEffect(() => {
    fetchCategories();
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'page_view' }),
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!search && !selectedCategory) {
      fetchAllVideos();
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    if (search || selectedCategory) {
      fetchSearchResults();
    }
  }, [search, selectedCategory]);

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      const cats = data.map((c: { name: string }) => c.name);
      setCategories(cats);

      const initialPages: Record<string, number> = {};
      cats.forEach((c: string) => { initialPages[c] = 1; });
      setCategoryPages(initialPages);

      cats.forEach((cat: string) => fetchCategoryPage(cat, 1));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function fetchAllVideos() {
    setLoading(true);
    try {
      const response = await fetch('/api/videos?limit=25&page=1');
      const result: PaginatedResponse = await response.json();
      setAllVideos(result.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategoryPage(cat: string, page: number) {
    try {
      const response = await fetch(`/api/videos?category=${encodeURIComponent(cat)}&limit=${CATEGORY_PAGE_SIZE}&page=${page}`);
      const result: PaginatedResponse = await response.json();
      setCategoryVideos(prev => ({ ...prev, [cat]: result.data }));
      setCategoryPages(prev => ({ ...prev, [cat]: result.page }));
      setCategoryTotalPages(prev => ({ ...prev, [cat]: result.totalPages }));
      setCategoryCounts(prev => ({ ...prev, [cat]: result.total }));
    } catch (error) {
      console.error(`Error fetching category ${cat}:`, error);
    }
  }

  async function fetchSearchResults() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (selectedCategory) params.set('category', selectedCategory);

    try {
      const response = await fetch(`/api/videos?${params.toString()}`);
      const data = await response.json();
      setSearchResults(data);

      if (search.trim()) {
        fetch('/api/analytics/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: search.trim(), results_count: data.length }),
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCategoryPageChange = useCallback((cat: string, newPage: number) => {
    fetchCategoryPage(cat, newPage);
  }, []);

  return (
    <div className="min-h-screen animated-gradient-bg">
      {/* Aurora blobs */}
      <div className="aurora-container">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
      </div>

      {/* Permanent Hero */}
      {!search && !selectedCategory && (
        <HeroGraphic />
      )}

      {/* Search & Filters */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-6" id="browse">
        <div className="relative max-w-xl mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            id="search"
            type="search"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo/30 transition-all duration-300"
            aria-describedby="search-hint"
          />
          <p id="search-hint" className="sr-only">Search by video title</p>
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`filter-pill ${selectedCategory === '' ? 'active' : ''}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          <div className="space-y-10">
            {[1, 2, 3].map((row) => (
              <div key={row}>
                <div className="skeleton h-6 w-40 mb-4" />
                <div className="flex gap-3 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((card) => (
                    <div key={card} className="flex-none w-[280px]">
                      <div className="skeleton aspect-video mb-2" />
                      <div className="skeleton h-4 w-3/4 mb-1" />
                      <div className="skeleton h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (search || selectedCategory) ? (
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-16">
          {searchResults.length === 0 ? (
            <div className="text-center py-24 glass-card">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[var(--bg-surface)] flex items-center justify-center">
                <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No videos found</h2>
              <p className="text-[var(--text-secondary)] max-w-md mx-auto">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <div className="scroll-rail">
              <div className="scroll-rail-inner" role="list" aria-label="Search results">
                {searchResults.map((video) => (
                  <div key={video.id} role="listitem">
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 max-w-[1440px] mx-auto pb-16" id="all-videos">
          {/* "All Videos" row — 25 most recent */}
          {allVideos.length > 0 && (
            <div className="scroll-rail" role="region" aria-label="All Videos">
              <h2 className="px-4 sm:px-12 mb-1 text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-indigo to-cyber rounded-full" />
                All Videos
              </h2>
              <div className="scroll-rail-inner" role="list">
                {allVideos.map((video) => (
                  <div key={video.id} role="listitem">
                    <VideoCard video={video} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category rows with pagination */}
          {categories.map((cat) => {
            const catVids = categoryVideos[cat] || [];
            const currentPage = categoryPages[cat] || 1;
            const totalPages = categoryTotalPages[cat] || 1;

            if (catVids.length === 0 && currentPage === 1) return null;

            return (
              <div key={cat} className="mb-4" role="region" aria-label={cat}>
                <div className="scroll-rail">
                  <h2 className="px-4 sm:px-12 mb-1 text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-coral to-lavender rounded-full" />
                    {cat}
                    {categoryCounts[cat] !== undefined && (
                      <span className="text-sm font-normal text-[var(--text-muted)]">({categoryCounts[cat]})</span>
                    )}
                  </h2>
                  <div className="scroll-rail-inner" role="list">
                    {catVids.map((video) => (
                      <div key={video.id} role="listitem">
                        <VideoCard video={video} />
                      </div>
                    ))}
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-3 px-4">
                    <button
                      onClick={() => handleCategoryPageChange(cat, currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo transition-colors"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[var(--text-secondary)]">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handleCategoryPageChange(cat, currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
