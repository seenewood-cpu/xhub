'use client';

import { useState, useEffect } from 'react';

interface ThumbnailPickerProps {
  fileId: string;
  onSelect: (url: string) => void;
  selectedUrl: string | null;
}

interface ThumbnailOption {
  id: string;
  url: string;
  label: string;
  width: number;
  height: number;
}

export default function ThumbnailPicker({ fileId, onSelect, selectedUrl }: ThumbnailPickerProps) {
  const [thumbnails, setThumbnails] = useState<ThumbnailOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fileId) return;
    setLoading(true);

    const options: ThumbnailOption[] = [
      { id: 'default', url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`, label: 'Default', width: 400, height: 225 },
      { id: 'large', url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`, label: 'Large', width: 800, height: 450 },
      { id: 'hd', url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w1280`, label: 'HD', width: 1280, height: 720 },
      { id: 'square', url: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`, label: 'Square', width: 400, height: 400 },
    ];

    const testPromises = options.map((option) => {
      return new Promise<ThumbnailOption | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(option);
        img.onerror = () => resolve(null);
        img.src = option.url;
      });
    });

    Promise.all(testPromises).then((results) => {
      const validThumbnails = results.filter((t): t is ThumbnailOption => t !== null);
      setThumbnails(validThumbnails);
      setLoading(false);
      if (validThumbnails.length > 0 && !selectedUrl) {
        onSelect(validThumbnails[0].url);
      }
    });
  }, [fileId, onSelect, selectedUrl]);

  if (loading) {
    return (
      <div className="mt-4">
        <p className="text-sm text-[var(--text-secondary)] mb-3">Loading thumbnails...</p>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-32 h-20" />
          ))}
        </div>
      </div>
    );
  }

  if (thumbnails.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-sm text-[var(--text-secondary)] mb-3">Select Thumbnail:</p>
      <div className="flex flex-wrap gap-3">
        {thumbnails.map((thumb) => (
          <button
            key={thumb.id}
            type="button"
            onClick={() => onSelect(thumb.url)}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-300 ${
              selectedUrl === thumb.url
                ? 'border-indigo ring-2 ring-indigo/30 shadow-lg shadow-indigo/20'
                : 'border-[var(--border)] hover:border-[var(--border-hover)]'
            }`}
          >
            <img
              src={thumb.url}
              alt={thumb.label}
              className="w-32 h-20 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs py-2 px-3 font-medium">
              {thumb.label}
            </div>
            {selectedUrl === thumb.url && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-indigo rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
