import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const fingerprint = searchParams.get('fingerprint') || '';

    const { count: likes } = await supabase
      .from('video_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', id)
      .eq('reaction', 'like');

    const { count: dislikes } = await supabase
      .from('video_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', id)
      .eq('reaction', 'dislike');

    let userReaction = null;
    if (fingerprint) {
      const { data } = await supabase
        .from('video_reactions')
        .select('reaction')
        .eq('video_id', id)
        .eq('user_fingerprint', fingerprint)
        .single();
      userReaction = data?.reaction || null;
    }

    return NextResponse.json({
      likes: likes || 0,
      dislikes: dislikes || 0,
      userReaction,
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json({ likes: 0, dislikes: 0, userReaction: null });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const body = await request.json();
    const { fingerprint, reaction } = body;

    if (!fingerprint || !['like', 'dislike'].includes(reaction)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from('video_reactions')
      .select('id, reaction')
      .eq('video_id', id)
      .eq('user_fingerprint', fingerprint)
      .single();

    if (existing) {
      if (existing.reaction === reaction) {
        await supabase.from('video_reactions').delete().eq('id', existing.id);
      } else {
        await supabase
          .from('video_reactions')
          .update({ reaction })
          .eq('id', existing.id);
      }
    } else {
      await supabase.from('video_reactions').insert({
        video_id: id,
        user_fingerprint: fingerprint,
        reaction,
      });
    }

    const { count: likes } = await supabase
      .from('video_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', id)
      .eq('reaction', 'like');

    const { count: dislikes } = await supabase
      .from('video_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('video_id', id)
      .eq('reaction', 'dislike');

    const { data: userR } = await supabase
      .from('video_reactions')
      .select('reaction')
      .eq('video_id', id)
      .eq('user_fingerprint', fingerprint)
      .single();

    return NextResponse.json({
      likes: likes || 0,
      dislikes: dislikes || 0,
      userReaction: userR?.reaction || null,
    });
  } catch (error) {
    console.error('Error updating reaction:', error);
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
  }
}
