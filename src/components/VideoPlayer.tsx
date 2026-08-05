'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getDriveEmbedUrl } from '@/lib/client-utils';

interface VideoPlayerProps {
  fileId: string;
  title: string;
  startAt?: number;
}

export default function VideoPlayer({ fileId, title, startAt = 0 }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorKind, setErrorKind] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const embedUrl = getDriveEmbedUrl(fileId, startAt);

  const simulateProgress = useCallback(() => {
    setLoadProgress(0);
    let progress = 0;
    progressInterval.current = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 15;
        setLoadProgress(Math.min(progress, 90));
      }
    }, 200);
  }, []);

  const stopProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setLoadProgress(100);
    setTimeout(() => setLoadProgress(0), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const handlePlay = useCallback(async () => {
    setIsPlaying(true);
    setIsLoading(true);
    setErrorKind(null);
    simulateProgress();
    try {
      const res = await fetch(`/api/drive-status?id=${encodeURIComponent(fileId)}`);
      const data = await res.json();
      if (data.status && data.status !== 'ok') {
        setErrorKind(data.status);
        setIsLoading(false);
        stopProgress();
        setHasError(true);
        return;
      }
    } catch {
      // Fall back to embed as-is
    }
  }, [fileId, simulateProgress, stopProgress]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    stopProgress();
  }, [stopProgress]);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    stopProgress();
    setHasError(true);
  }, [stopProgress]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (!isPlaying) handlePlay();
          break;
        case 'f':
          if (containerRef.current) {
            if (document.fullscreenElement) document.exitFullscreen();
            else containerRef.current.requestFullscreen();
          }
          break;
        case 'escape':
          if (document.fullscreenElement) document.exitFullscreen();
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handlePlay]);

  if (hasError) {
    return (
      <div className="player-container relative aspect-video bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border)]">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 mb-6 rounded-full bg-coral/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Unable to load video</h3>
          <p className="text-[var(--text-secondary)] max-w-md">
            {errorKind === 'restricted'
              ? 'This video is not publicly available. The uploader must share the file with "Anyone with the link" access.'
              : errorKind === 'missing'
                ? 'This video file no longer exists. It may have been moved or deleted.'
                : 'This video may have exceeded its viewing quota or the sharing permissions need to be updated.'}
          </p>
        </div>
      </div>
    );
  }

  if (!isPlaying) {
    return (
      <div
        ref={containerRef}
        className="player-container relative aspect-video bg-gradient-to-br from-[var(--bg-secondary)] via-[var(--bg-card)] to-abyss rounded-2xl overflow-hidden cursor-pointer group border border-[var(--border)]"
        onClick={handlePlay}
        role="button"
        tabIndex={0}
        aria-label={`Play ${title}`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlay();
          }
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="absolute -inset-8 bg-indigo/20 rounded-full blur-2xl group-hover:bg-indigo/30 transition-all duration-500" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-indigo to-lavender rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
              <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-indigo/50">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Click to play</p>
              <p className="text-white/60 text-xs">Press Space or F for fullscreen</p>
            </div>
          </div>
        </div>

        <div className="absolute top-4 right-4">
          <div className="px-3 py-1.5 bg-indigo/90 rounded-md backdrop-blur-sm">
            <span className="text-white text-xs font-bold tracking-wide">HD</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="player-container relative aspect-video rounded-2xl overflow-hidden border border-[var(--border)]"
      >
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-[var(--bg-card)] flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-indigo/30" />
              <div className="absolute inset-0 rounded-full border-2 border-t-indigo border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <p className="text-[var(--text-secondary)] text-sm">Loading video...</p>
            {loadProgress > 0 && loadProgress < 100 && (
              <div className="w-48 h-1 bg-[var(--bg-surface)] rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo to-cyber rounded-full transition-all duration-200"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={embedUrl}
          title={title}
          className="w-full h-full"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />

        {/* Permanently block Google Drive pop-out button */}
        <div
          className="drive-popout-blocker"
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          onMouseUp={(e) => { e.stopPropagation(); e.preventDefault(); }}
          aria-hidden="true"
        />
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] rounded text-[10px] font-mono border border-[var(--border)]">Space</kbd>
          Play
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-1.5 py-0.5 bg-[var(--bg-surface)] rounded text-[10px] font-mono border border-[var(--border)]">F</kbd>
          Fullscreen
        </span>
      </div>
    </>
  );
}
