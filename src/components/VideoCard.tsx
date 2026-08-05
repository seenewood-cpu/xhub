'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Video } from '@/types/video';

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [thumbnailError, setThumbnailError] = useState(false);
  const thumbnailUrl = video.drive_file_id
    ? `https://drive.google.com/thumbnail?id=${video.drive_file_id}&sz=w480`
    : '';

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  };

  return (
    <article className="rail-tile group">
      <Link
        href={`/video/${video.id}`}
        className="block focus:outline-none"
        aria-label={`Watch ${video.title}`}
      >
        <div className="relative aspect-video overflow-hidden bg-abyss-card">
          {thumbnailUrl && !thumbnailError ? (
            <Image
              src={thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width: 480px) 180px, (max-width: 768px) 220px, 280px"
              className="object-cover transition-all duration-500 group-hover:scale-110"
              onError={() => setThumbnailError(true)}
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo/20 to-coral/10">
              <svg className="w-12 h-12 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Play button - shown on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="w-14 h-14 bg-indigo/90 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg shadow-indigo/40 transform scale-75 group-hover:scale-100 transition-all duration-300">
              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* Category badge */}
          {video.category && (
            <div className="absolute top-3 left-3 z-10">
              <span className="px-2.5 py-1 text-[10px] font-bold bg-indigo/90 text-white rounded-md backdrop-blur-sm uppercase tracking-wider">
                {video.category}
              </span>
            </div>
          )}

          {/* Time ago */}
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="px-2 py-1 text-[10px] font-medium bg-black/70 text-white rounded backdrop-blur-sm">
              {timeAgo(video.created_at)}
            </span>
          </div>

          <span className="sr-only">Play video</span>
        </div>

        {/* Info section */}
        <div className="p-3 bg-[var(--bg-card)] group-hover:bg-[var(--bg-card-hover)] transition-colors duration-300">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-2 mb-1 group-hover:text-indigo transition-colors duration-300">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            {video.category && <span>{video.category}</span>}
            {video.category && video.view_count > 0 && <span>·</span>}
            {video.view_count > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {formatViews(video.view_count)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
