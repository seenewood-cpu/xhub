import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { extractDriveFileId, toTitleCase } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');

    let videoIds: number[] | null = null;

    if (category) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      if (catData) {
        const { data: vcData } = await supabase
          .from('video_categories')
          .select('video_id')
          .eq('category_id', catData.id);

        videoIds = (vcData || []).map((r: { video_id: number }) => r.video_id);
        if (videoIds.length === 0) {
          return NextResponse.json(
            { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }
          );
        }
      } else {
        return NextResponse.json(
          { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }
        );
      }
    }

    let query = supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (videoIds) {
      query = query.in('id', videoIds);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const hasPagination = limitParam || pageParam;

    if (hasPagination) {
      const limit = Math.min(parseInt(limitParam || '50', 10), 100);
      const page = Math.max(parseInt(pageParam || '1', 10), 1);
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    const videos = data || [];

    const { data: allVC } = await supabase
      .from('video_categories')
      .select('video_id, category_id');

    const { data: allCats } = await supabase
      .from('categories')
      .select('id, name');

    const catMap = new Map((allCats || []).map((c: { id: number; name: string }) => [c.id, c.name]));
    const videoCatMap = new Map<number, number[]>();
    for (const row of allVC || []) {
      const list = videoCatMap.get(row.video_id) || [];
      list.push(row.category_id);
      videoCatMap.set(row.video_id, list);
    }

    const enriched = videos.map((v: Record<string, unknown>) => ({
      ...v,
      category_ids: videoCatMap.get(v.id as number) || [],
    }));

    if (hasPagination) {
      const limit = parseInt(limitParam || '50', 10);
      const page = parseInt(pageParam || '1', 10);
      const total = count || 0;
      return NextResponse.json({
        data: enriched,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    return NextResponse.json(enriched);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    if (!body.title || !body.drive_url) {
      return NextResponse.json(
        { error: 'Title and drive URL are required' },
        { status: 400 }
      );
    }

    const fileId = extractDriveFileId(body.drive_url);
    if (!fileId) {
      return NextResponse.json(
        { error: 'Invalid video link' },
        { status: 400 }
      );
    }

    const titleCased = toTitleCase(body.title);

    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id')
      .ilike('title', titleCased)
      .limit(1);

    if (existingVideo && existingVideo.length > 0) {
      return NextResponse.json(
        { error: `A video with the title "${titleCased}" already exists. Please choose a different name.` },
        { status: 409 }
      );
    }

    const categoryIds: number[] = body.category_ids || [];

    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          title: titleCased,
          description: body.description || '',
          drive_url: body.drive_url,
          drive_file_id: fileId,
          thumbnail_url: body.thumbnail_url || '',
          category: categoryIds.length > 0 ? '' : '',
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (categoryIds.length > 0) {
      const vcRows = categoryIds.map((cid: number) => ({
        video_id: data.id,
        category_id: cid,
      }));
      const { error: vcError } = await supabase
        .from('video_categories')
        .insert(vcRows);
      if (vcError) {
        console.error('Error linking categories:', vcError);
      }
    }

    return NextResponse.json({ ...data, category_ids: categoryIds }, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
