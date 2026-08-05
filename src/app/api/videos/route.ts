import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { extractDriveFileId, toTitleCase } from '@/lib/utils';
import { VideoFormData } from '@/types/video';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const limitParam = searchParams.get('limit');
    const pageParam = searchParams.get('page');

    let query = supabase
      .from('videos')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
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

    if (hasPagination) {
      const limit = parseInt(limitParam || '50', 10);
      const page = parseInt(pageParam || '1', 10);
      const total = count || 0;
      return NextResponse.json({
        data: data || [],
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    return NextResponse.json(data || []);
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
    const body: VideoFormData = await request.json();

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

    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          title: toTitleCase(body.title),
          description: body.description || '',
          drive_url: body.drive_url,
          drive_file_id: fileId,
          thumbnail_url: body.thumbnail_url || '',
          category: body.category || '',
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
