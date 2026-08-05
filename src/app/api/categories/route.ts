import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      const msg = (error.message || error.details || error.hint || '').toLowerCase();
      const code = error.code || '';
      if (msg.includes('does not exist') || msg.includes('relation') || code === '42P01' || code === '42703') {
        return NextResponse.json([]);
      }
      throw error;
    }
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await request.json();

    if (!body.name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name: body.name.trim() })
      .select()
      .single();

    if (error) {
      const msg = (error.message || error.details || error.hint || '').toLowerCase();
      const code = error.code || '';
      if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('row-level security') || code === '42P01' || code === '42703' || code === '42501') {
        return NextResponse.json(
          { error: 'Categories table not found or not accessible. Please run the migration SQL in your Supabase dashboard SQL Editor.' },
          { status: 500 }
        );
      }
      if (code === '23505') {
        return NextResponse.json(
          { error: 'Category already exists' },
          { status: 409 }
        );
      }
      console.error('Supabase error creating category:', { code, message: error.message, details: error.details, hint: error.hint });
      throw error;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
