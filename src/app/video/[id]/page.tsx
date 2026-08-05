'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';
import { Video } from '@/types/video';

const UP_NEXT_COUNT = 6;
const SEEN_KEY = 'vh-up-next-seen';
const FP_KEY = 'vh-fingerprint';

function getSeenIds(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = sessionStorage.getItem(SEEN_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addSeenIds(ids: number[]) {
  if (typeof window === 'undefined') return;
  try {
    const seen = getSeenIds();
    ids.forEach((id) => seen.add(id));
    sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {}
}

function clearSeenIds() {
  if (typeof window === 'undefined') return;
  try { sessionStorage.removeItem(SEEN_KEY); } catch {}
}

function getFingerprint(): string {
  if (typeof window === 'undefined') return '';
  let fp = localStorage.getItem(FP_KEY);
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(FP_KEY, fp);
  }
  return fp;
}

export default function VideoPage() {
  const params = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reactions, setReactions] = useState<{ likes: number; dislikes: number; userReaction: string | null }>({ likes: 0, dislikes: 0, userReaction: null });
  const seenRef = useRef<Set<number>>(new Set());

  const fetchRelated = useCallback(async (currentVideo: Video) => {
    try {
      const response = await fetch('/api/videos');
      const allVideos: Video[] = await response.json();

      const seen = getSeenIds();
      seenRef.current = seen;

      const currentCatIds = new Set(currentVideo.category_ids || []);
      const sameCategory = allVideos.filter(
        (v) => v.id !== currentVideo.id && (v.category_ids || []).some((id: number) => currentCatIds.has(id))
      );

      const unseen = allVideos.filter(
        (v) => v.id !== currentVideo.id && !seen.has(v.id)
      );

      let picks = sameCategory.filter((v) => !seen.has(v.id));

      if (picks.length < UP_NEXT_COUNT) {
        const extras = unseen.filter((v) => !picks.includes(v));
        picks = [...picks, ...extras];
      }

      if (picks.length < UP_NEXT_COUNT) {
        clearSeenIds();
        seenRef.current = new Set([currentVideo.id]);
        picks = allVideos.filter((v) => v.id !== currentVideo.id);
      }

      const final = picks.slice(0, UP_NEXT_COUNT);
      addSeenIds(final.map((v) => v.id));
      setRelatedVideos(final);
    } catch (err) {
      console.error('Error fetching related videos:', err);
    }
  }, []);

  useEffect(() => {
    async function fetchVideo() {
      setLoading(true);
      try {
        const response = await fetch(`/api/videos/${params.id}`);
        if (!response.ok) throw new Error('Video not found');
        const data = await response.json();
        setVideo(data);

        fetch('/api/videos/${params.id}/view', { method: 'POST' }).then((res) => {
          if (res.ok)
            res.json().then((d) => {
              setVideo((prev) => (prev ? { ...prev, view_count: d.view_count } : prev));
            });
        });

        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'video_view',
            metadata: { video_id: data.id, title: data.title },
          }),
        }).catch(() => {});

        const fp = getFingerprint();
        fetch(`/api/videos/${params.id}/reactions?fingerprint=${fp}`)
          .then(r => r.json())
          .then(d => setReactions(d))
          .catch(() => {});

        await fetchRelated(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
      } finally {
        setLoading(false);
      }
    }
    fetchVideo();
  }, [params.id, fetchRelated]);

  async function handleReaction(type: 'like' | 'dislike') {
    const fp = getFingerprint();
    try {
      const res = await fetch(`/api/videos/${params.id}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fingerprint: fp, reaction: type }),
      });
      if (res.ok) setReactions(await res.json());
    } catch {}
  }

  const total = reactions.likes + reactions.dislikes;
  const likePct = total > 0 ? Math.round((reactions.likes / total) * 100) : 50;

  if (loading) {
    return (
      <div className="min-h-screen animated-gradient-bg">
        <div className="aurora-container">
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-2" />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-12">
          <div className="skeleton aspect-video rounded-2xl mb-8" />
          <div className="skeleton h-8 w-3/4 mb-4" />
          <div className="skeleton h-5 w-1/2 mb-6" />
          <div className="skeleton h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen animated-gradient-bg">
        <div className="aurora-container">
          <div className="aurora-blob aurora-blob-1" />
          <div className="aurora-blob aurora-blob-3" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-24">
          <div className="text-center py-16 glass-card">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-coral/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Video Not Found</h1>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">
              {error || 'The video you are looking for does not exist or has been removed.'}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo text-white rounded-xl font-medium hover:bg-indigo/80 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const thumbUrl = video.drive_file_id
    ? `https://drive.google.com/thumbnail?id=${video.drive_file_id}&sz=w1920`
    : '';

  return (
    <div className="min-h-screen animated-gradient-bg">
      <div className="aurora-container">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
      </div>

      {thumbUrl && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <img
            src={thumbUrl}
            alt=""
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] object-cover opacity-15 blur-[120px]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-16">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-[var(--text-muted)] hover:text-indigo transition-colors focus:outline-none focus:ring-2 focus:ring-indigo rounded px-1"
              >
                Gallery
              </Link>
            </li>
            <li aria-hidden="true">
              <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-[var(--text-primary)] font-medium truncate max-w-xs" aria-current="page">
              {video.title}
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <article>
              <VideoPlayer fileId={video.drive_file_id} title={video.title} />

              <div className="mt-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">{video.title}</h1>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {video.category && (
                    <span className="category-tag">
                      {video.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {(video.view_count || 0).toLocaleString()} views
                  </span>
                  <time className="text-sm text-[var(--text-muted)]" dateTime={video.created_at}>
                    {new Date(video.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] overflow-hidden">
                    <button
                      onClick={() => handleReaction('like')}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        reactions.userReaction === 'like'
                          ? 'bg-green-500/20 text-green-400'
                          : 'text-[var(--text-muted)] hover:bg-green-500/10 hover:text-green-400'
                      }`}
                      aria-label="Like"
                    >
                      <svg className="w-5 h-5" fill={reactions.userReaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      {reactions.likes.toLocaleString()}
                    </button>
                    <button
                      onClick={() => handleReaction('dislike')}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                        reactions.userReaction === 'dislike'
                          ? 'bg-coral/20 text-coral'
                          : 'text-[var(--text-muted)] hover:bg-coral/10 hover:text-coral'
                      }`}
                      aria-label="Dislike"
                    >
                      <svg className="w-5 h-5" fill={reactions.userReaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                      {reactions.dislikes.toLocaleString()}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500" style={{ width: `${likePct}%` }} />
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    {total > 0 ? `${likePct}% liked` : 'No ratings'}
                  </p>
                </div>
              </div>
            </article>
          </div>

          {relatedVideos.length > 0 && (
            <aside className="w-full lg:w-[380px] flex-shrink-0" aria-label="Related videos">
              <div className="sticky top-24">
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gradient-to-b from-coral to-lavender rounded-full" />
                  Up Next
                </h2>
                <div className="space-y-3">
                  {relatedVideos.map((related) => (
                    <Link
                      key={related.id}
                      href={`/video/${related.id}`}
                      className="flex gap-3 p-2 rounded-xl glass-card hover:bg-[var(--bg-card-hover)] transition-all duration-300 group"
                    >
                      <div className="w-36 h-20 bg-[var(--bg-surface)] rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                        {related.drive_file_id && (
                          <img
                            src={`https://drive.google.com/thumbnail?id=${related.drive_file_id}&sz=w320`}
                            alt={related.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-indigo/90 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 group-hover:text-indigo transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {(related.view_count || 0).toLocaleString()} views
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
