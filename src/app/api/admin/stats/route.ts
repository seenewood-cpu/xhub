import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabase();

    const [
      { count: totalPageViews },
      { data: uniqueIps },
      { data: recentIps },
      { data: countryData },
      { data: topVideos },
      { data: topSearchQueries },
      { data: topSearchVideos },
      { data: recentSearches },
    ] = await Promise.all([
      supabase.from('analytics').select('*', { count: 'exact', head: true }),
      supabase.from('analytics').select('ip_address'),
      supabase.from('analytics').select('ip_address').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('analytics').select('country, ip_address').not('country', 'is', null),
      supabase.from('videos').select('id, title, drive_file_id, view_count, category').order('view_count', { ascending: false }).limit(5),
      supabase.from('searches').select('query').order('created_at', { ascending: false }).limit(1000),
      supabase.from('searches').select('query, results_count').gt('results_count', 0).order('created_at', { ascending: false }).limit(500),
      supabase.from('searches').select('query, results_count, created_at').order('created_at', { ascending: false }).limit(20),
    ]);

    const totalUsers = uniqueIps ? new Set(uniqueIps.map((r: { ip_address: string }) => r.ip_address)).size : 0;
    const activeUsers = recentIps ? new Set(recentIps.map((r: { ip_address: string }) => r.ip_address)).size : 0;

    const countryCounts: Record<string, number> = {};
    if (countryData) {
      for (const row of countryData) {
        const c = (row as { country: string }).country;
        if (c) countryCounts[c] = (countryCounts[c] || 0) + 1;
      }
    }
    const countries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    const queryCounts: Record<string, number> = {};
    if (topSearchQueries) {
      for (const row of topSearchQueries) {
        const q = (row as { query: string }).query.toLowerCase().trim();
        if (q) queryCounts[q] = (queryCounts[q] || 0) + 1;
      }
    }
    const mostSearchedTopics = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }));

    const videoSearchCounts: Record<string, { query: string; count: number }> = {};
    if (topSearchVideos) {
      for (const row of topSearchVideos) {
        const q = (row as { query: string }).query.toLowerCase().trim();
        if (q) {
          if (videoSearchCounts[q]) {
            videoSearchCounts[q].count++;
          } else {
            videoSearchCounts[q] = { query: q, count: 1 };
          }
        }
      }
    }
    const mostSearchedVideos = Object.values(videoSearchCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      countries,
      topVideos: topVideos || [],
      mostSearchedTopics,
      mostSearchedVideos,
      recentSearches: recentSearches || [],
      totalPageViews: totalPageViews || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
