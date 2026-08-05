import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { extractDriveFileId, toTitleCase } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    const { data: vcData } = await supabase
      .from('video_categories')
      .select('category_id')
      .eq('video_id', data.id);

    const categoryIds = (vcData || []).map((r: { category_id: number }) => r.category_id);

    return NextResponse.json({ ...data, category_ids: categoryIds });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const body = await request.json();

    const { data: existing, error: fetchError } = await supabase
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    let fileId = existing.drive_file_id;
    if (body.drive_url && body.drive_url !== existing.drive_url) {
      fileId = extractDriveFileId(body.drive_url);
      if (!fileId) {
        return NextResponse.json(
          { error: 'Invalid video link' },
          { status: 400 }
        );
      }
    }

    const categoryIds: number[] | undefined = body.category_ids;

    const { data, error } = await supabase
      .from('videos')
      .update({
        title: body.title ? toTitleCase(body.title) : existing.title,
        description: body.description ?? existing.description,
        drive_url: body.drive_url || existing.drive_url,
        drive_file_id: fileId,
        thumbnail_url: body.thumbnail_url ?? existing.thumbnail_url,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (categoryIds !== undefined) {
      await supabase
        .from('video_categories')
        .delete()
        .eq('video_id', data.id);

      if (categoryIds.length > 0) {
        const vcRows = categoryIds.map((cid: number) => ({
          video_id: data.id,
          category_id: cid,
        }));
        await supabase.from('video_categories').insert(vcRows);
      }
    }

    return NextResponse.json({ ...data, category_ids: categoryIds || [] });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: existing, error: fetchError } = await supabase
      .from('videos')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    await supabase
      .from('video_categories')
      .delete()
      .eq('video_id', existing.id);

    const { error } = await supabase.from('videos').delete().eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
