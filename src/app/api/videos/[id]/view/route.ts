import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('videos')
      .select('view_count')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const newCount = (data.view_count || 0) + 1;

    const { error: updateError } = await supabase
      .from('videos')
      .update({ view_count: newCount })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ view_count: newCount });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ error: 'Failed to track view' }, { status: 500 });
  }
}
