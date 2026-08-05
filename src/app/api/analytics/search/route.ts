import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();
    const { query, results_count } = body;

    if (!query?.trim()) {
      return NextResponse.json({ success: true });
    }

    const ip = getClientIp(request);

    const { error } = await supabase
      .from('searches')
      .insert({
        query: query.trim(),
        results_count: results_count || 0,
      });

    if (error) throw error;

    await supabase.from('analytics').insert({
      event_type: 'search',
      ip_address: ip,
      metadata: { query: query.trim() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking search:', error);
    return NextResponse.json({ success: true });
  }
}
