import { NextRequest, NextResponse } from 'next/server';

// Checks whether a Google Drive file is publicly embeddable (shared with
// "Anyone with the link"). Restricted files make the Drive embed show
// Google's cryptic "400. That's an error..." page, so we detect it up front
// and show a clear message instead.
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ status: 'invalid' });
  }

  try {
    const res = await fetch(`https://drive.google.com/file/d/${id}/view`, {
      redirect: 'follow',
      cache: 'no-store',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (res.status === 200) {
      return NextResponse.json({ status: 'ok' });
    }
    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ status: 'restricted' });
    }
    if (res.status === 404) {
      return NextResponse.json({ status: 'missing' });
    }
    return NextResponse.json({ status: 'unknown', code: res.status });
  } catch {
    return NextResponse.json({ status: 'unknown' });
  }
}
