'use client';

import { useState, useEffect } from 'react';
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

export default function GalleryPage() {
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<Video[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat) {
      setSelectedCategory(cat);
    }
  }, []);

  useEffect(() => {
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

  async function fetchAllVideos() {
    setLoading(true);
    try {
      const response = await fetch('/api/videos?limit=30&page=1');
      const result: PaginatedResponse = await response.json();
      setAllVideos(result.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
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

      {/* Search */}
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
        </div>
      )}
    </div>
  );
}
