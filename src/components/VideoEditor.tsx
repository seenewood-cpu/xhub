'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface VideoEditorProps {
  onVideoProcessed?: (processedBlob: Blob, thumbnail: string) => void;
}

interface TrimRange {
  start: number;
  end: number;
}

interface BannerConfig {
  text: string;
  speed: number;
  color: string;
  backgroundColor: string;
  fontSize: number;
  enabled: boolean;
}

interface CropConfig {
  offsetX: number;
  offsetY: number;
  enabled: boolean;
}

export default function VideoEditor({ onVideoProcessed }: VideoEditorProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('');
  const [thumbnail, setThumbnail] = useState<string>('');
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string>('');

  const [trimRange, setTrimRange] = useState<TrimRange>({ start: 0, end: 0 });
  const [banner, setBanner] = useState<BannerConfig>({
    text: 'Your Website URL',
    speed: 5,
    color: '#ffffff',
    backgroundColor: '#000000',
    fontSize: 24,
    enabled: false,
  });
  const [crop, setCrop] = useState<CropConfig>({
    offsetX: 0,
    offsetY: 0,
    enabled: false,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const initFFmpeg = async () => {
      if (ffmpegLoaded || ffmpegLoading) return;
      setFfmpegLoading(true);

      try {
        const ffmpeg = new FFmpeg();
        ffmpegRef.current = ffmpeg;

        ffmpeg.on('progress', ({ progress }) => {
          setProcessingProgress(Math.round(progress * 100));
        });

        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });

        setFfmpegLoaded(true);
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
      } finally {
        setFfmpegLoading(false);
      }
    };

    initFFmpeg();
  }, [ffmpegLoaded, ffmpegLoading]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setThumbnail('');
    }
  }, []);

  const handleVideoLoaded = useCallback(() => {
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      setVideoDuration(duration);
      setTrimRange({ start: 0, end: duration });
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const generateThumbnail = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw banner if enabled
    if (banner.enabled && banner.text) {
      const bannerHeight = banner.fontSize + 20;
      ctx.fillStyle = banner.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, bannerHeight);

      ctx.fillStyle = banner.color;
      ctx.font = `bold ${banner.fontSize}px Arial`;
      ctx.textBaseline = 'middle';
      ctx.fillText(banner.text, 20, bannerHeight / 2);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setThumbnail(dataUrl);
    return dataUrl;
  }, [banner]);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const processVideo = async () => {
    if (!ffmpegRef.current || !videoFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingMessage('Processing video...');

    try {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

      const hasTrim = trimRange.start > 0 || trimRange.end < videoDuration;
      const hasBanner = banner.enabled && banner.text;
      const hasCrop = crop.enabled && (crop.offsetX !== 0 || crop.offsetY !== 0);

      let ffmpegArgs: string[] = [];

      if (hasBanner || hasCrop) {
        const filters: string[] = [];

        if (hasCrop) {
          const cropX = Math.abs(crop.offsetX);
          const cropY = Math.abs(crop.offsetY);
          filters.push(`crop=iw-${cropX * 2}:ih-${cropY * 2}:${cropX}:${cropY}`);
        }

        if (hasBanner) {
          const bannerHeight = banner.fontSize + 20;
          filters.push(`drawbox=x=0:y=0:w=iw:h=${bannerHeight}:color=${banner.backgroundColor}@0.8,drawtext=text='${banner.text}':fontcolor=${banner.color}:fontsize=${banner.fontSize}:x=(w-text_w)/2:y=${bannerHeight / 2 - banner.fontSize / 2}`);
        }

        const vf = filters.join(',');

        ffmpegArgs = ['-i', 'input.mp4'];
        if (hasTrim) {
          ffmpegArgs.push('-ss', trimRange.start.toString());
        }
        ffmpegArgs.push('-vf', vf, '-c:v', 'libx264', '-c:a', 'copy');
        if (hasTrim) {
          ffmpegArgs.push('-to', (trimRange.end - trimRange.start).toString());
        }
      } else if (hasTrim) {
        ffmpegArgs = [
          '-i', 'input.mp4',
          '-ss', trimRange.start.toString(),
          '-to', trimRange.end.toString(),
          '-c', 'copy',
        ];
      } else {
        ffmpegArgs = ['-i', 'input.mp4', '-c', 'copy'];
      }

      ffmpegArgs.push('output.mp4');
      await ffmpeg.exec(ffmpegArgs);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

      setProcessedBlob(blob);
      setProcessedUrl(URL.createObjectURL(blob));

      const thumbDataUrl = generateThumbnail();

      if (onVideoProcessed) {
        onVideoProcessed(blob, thumbDataUrl || '');
      }

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
    } catch (error) {
      console.error('Error processing video:', error);
      setProcessingMessage('Error processing video');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingMessage('');
    }
  };

  const downloadProcessed = () => {
    const urlToDownload = processedUrl || videoUrl;
    const namePrefix = processedBlob ? 'processed_' : '';
    const link = document.createElement('a');
    link.href = urlToDownload;
    link.download = `${namePrefix}${videoFile?.name || 'video.mp4'}`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Video Editor</h2>

      {/* File Upload */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
          id="video-upload"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
        >
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-600 mb-2">Click to upload a video</p>
          <p className="text-sm text-gray-500">MP4, WebM, or MOV (max 500MB)</p>
        </button>
      </div>

      {/* Video Preview */}
      {videoUrl && (
        <div className="mb-6">
          <div className="relative bg-black rounded-lg overflow-hidden mb-4">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full max-h-96"
              onLoadedMetadata={handleVideoLoaded}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Banner Preview Overlay */}
            {banner.enabled && banner.text && (
              <div
                className="absolute top-0 left-0 right-0 overflow-hidden"
                style={{
                  height: `${banner.fontSize + 20}px`,
                  backgroundColor: banner.backgroundColor,
                }}
              >
                <div
                  className="whitespace-nowrap"
                  style={{
                    color: banner.color,
                    fontSize: `${banner.fontSize}px`,
                    fontWeight: 'bold',
                    animation: `marquee ${banner.speed}s linear infinite`,
                  }}
                >
                  {banner.text}
                </div>
              </div>
            )}
          </div>

          {/* Hidden canvas for thumbnail generation */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Playback Controls */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={togglePlay}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            <span className="text-sm text-gray-600">
              {formatTime(currentTime)} / {formatTime(videoDuration)}
            </span>

            <input
              type="range"
              min={0}
              max={videoDuration || 100}
              step={0.1}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              className="flex-1"
            />
          </div>
        </div>
      )}

      {/* Trimming Controls */}
      {videoUrl && videoDuration > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Trim Video</h3>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Time</label>
              <input
                type="range"
                min={0}
                max={trimRange.end - 0.1}
                step={0.1}
                value={trimRange.start}
                onChange={(e) => setTrimRange({ ...trimRange, start: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{formatTime(trimRange.start)}</span>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">End Time</label>
              <input
                type="range"
                min={trimRange.start + 0.1}
                max={videoDuration}
                step={0.1}
                value={trimRange.end}
                onChange={(e) => setTrimRange({ ...trimRange, end: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-sm text-gray-600">{formatTime(trimRange.end)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Duration: {formatTime(trimRange.end - trimRange.start)}
          </p>
        </div>
      )}

      {/* Crop Controls */}
      {videoUrl && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Crop Video</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={crop.enabled}
                onChange={(e) => setCrop({ ...crop, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">Enable</span>
            </label>
          </div>

          {crop.enabled && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-gray-600">Horizontal Offset (X)</label>
                  <span className="text-sm font-medium text-gray-900">{crop.offsetX}px</span>
                </div>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  step={1}
                  value={crop.offsetX}
                  onChange={(e) => setCrop({ ...crop, offsetX: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>-200px</span>
                  <span>0px</span>
                  <span>+200px</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-gray-600">Vertical Offset (Y)</label>
                  <span className="text-sm font-medium text-gray-900">{crop.offsetY}px</span>
                </div>
                <input
                  type="range"
                  min={-200}
                  max={200}
                  step={1}
                  value={crop.offsetY}
                  onChange={(e) => setCrop({ ...crop, offsetY: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>-200px</span>
                  <span>0px</span>
                  <span>+200px</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Positive values crop from the edge inward. Negative values expand beyond the original frame.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Banner Overlay Controls */}
      {videoUrl && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Banner Overlay</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={banner.enabled}
                onChange={(e) => setBanner({ ...banner, enabled: e.target.checked })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-600">Enable</span>
            </label>
          </div>

          {banner.enabled && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Banner Text</label>
                <input
                  type="text"
                  value={banner.text}
                  onChange={(e) => setBanner({ ...banner, text: e.target.value })}
                  className="input-field w-full"
                  placeholder="Enter banner text"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Text Color</label>
                  <input
                    type="color"
                    value={banner.color}
                    onChange={(e) => setBanner({ ...banner, color: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Background</label>
                  <input
                    type="color"
                    value={banner.backgroundColor}
                    onChange={(e) => setBanner({ ...banner, backgroundColor: e.target.value })}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Font Size: {banner.fontSize}px</label>
                  <input
                    type="range"
                    min={12}
                    max={48}
                    value={banner.fontSize}
                    onChange={(e) => setBanner({ ...banner, fontSize: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Speed: {banner.speed}s</label>
                  <input
                    type="range"
                    min={2}
                    max={20}
                    value={banner.speed}
                    onChange={(e) => setBanner({ ...banner, speed: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Thumbnail Generation */}
      {videoUrl && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-3">Thumbnail</h3>

          <button
            onClick={generateThumbnail}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 mb-3"
          >
            Generate Thumbnail
          </button>

          {thumbnail && (
            <div className="mt-3">
              <img
                src={thumbnail}
                alt="Video thumbnail"
                className="max-w-full h-auto rounded-lg border border-gray-200"
              />
              <a
                href={thumbnail}
                download="thumbnail.jpg"
                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
              >
                Download Thumbnail
              </a>
            </div>
          )}
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
            <span className="text-blue-800">{processingMessage || 'Processing...'}</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
          <p className="text-sm text-blue-600 mt-1">{processingProgress}%</p>
        </div>
      )}

      {/* Action Buttons */}
      {videoUrl && (
        <div className="flex gap-4">
          <button
            onClick={processVideo}
            disabled={!ffmpegLoaded || isProcessing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Processing...' : 'Process Video'}
          </button>

          {processedBlob && (
            <button
              onClick={downloadProcessed}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Download Edited Video
            </button>
          )}
        </div>
      )}

      {/* FFmpeg Status */}
      <div className="mt-4 text-sm text-gray-500">
        {ffmpegLoading && 'Loading video processor...'}
        {ffmpegLoaded && 'Video processor ready'}
        {!ffmpegLoading && !ffmpegLoaded && 'Click to load video processor'}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
