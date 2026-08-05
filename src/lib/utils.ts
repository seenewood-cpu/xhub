const SMALL_WORDS = new Set([
  'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'for', 'yet', 'so',
  'at', 'by', 'in', 'of', 'on', 'to', 'up', 'as', 'is', 'if', 'it',
  'vs', 'via', 'ok',
]);

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/(\s+)/)
    .map((word, index) => {
      if (/^\s+$/.test(word)) return word;
      const clean = word.replace(/[^a-zA-Z0-9]/g, '');
      if (index === 0 || !SMALL_WORDS.has(clean.toLowerCase())) {
        return word.replace(/[a-zA-Z]/, (c) => c.toUpperCase());
      }
      return word;
    })
    .join('');
}

export function extractDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/open\?id=([a-zA-Z0-9_-]+)/,
    /\/uc\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function isValidDriveUrl(url: string): boolean {
  return extractDriveFileId(url) !== null;
}

export function getDriveEmbedUrl(fileId: string, startAt: number = 0): string {
  const base = `https://drive.google.com/file/d/${fileId}/preview`;
  return startAt > 0 ? `${base}?start=${startAt}` : base;
}

export function getDriveOpenUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function fakeEngagement(videoId: number) {
  const s1 = videoId * 2654435761 >>> 0;
  const s2 = (videoId * 2246822519) >>> 0;
  const s3 = (videoId * 3266489917) >>> 0;
  const views = 5000 + (s1 % 80000);
  const likes = 800 + (s2 % 12000);
  const dislikes = Math.round(likes * (0.12 + (s3 % 100) / 500));
  return { views, likes, dislikes };
}
