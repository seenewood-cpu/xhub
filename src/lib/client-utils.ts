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
