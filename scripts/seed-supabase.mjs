import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase env vars. Create .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// OLD placeholder IDs from the first seed run. They do not exist in Google Drive
// and were causing the "Fix common issues related to storage access" error.
const OLD_FAKE_IDS = [
  '1PDrPMDjD2jKpJcC0k2W5L5p5q5r5s5t',
  '2QEsQNEeE3kLqMdD1l3X6M6q6r6s6t6u',
  '3RFtRNFfF4mLrNeE2m4Y7N7r7s7t7u7v',
];

const sampleVideos = [
  {
    title: 'Sample Movie Clip',
    description: 'A sample movie clip hosted on Google Drive, used to demonstrate video playback.',
    drive_url: 'https://drive.google.com/file/d/10N111TfBknfp_dIsVGqegf-SINLpzDKC/view',
    drive_file_id: '10N111TfBknfp_dIsVGqegf-SINLpzDKC',
    category: 'Demo',
  },
  {
    title: 'Autonomous Driving Demo',
    description: 'A demo clip of an autonomous driving agent navigating an intersection, rendered in the CARLA simulator.',
    drive_url: 'https://drive.google.com/file/d/1rURmlHGFAXoQS0onCkoxaD1Rd1pQBk08/view',
    drive_file_id: '1rURmlHGFAXoQS0onCkoxaD1Rd1pQBk08',
    category: 'Tech',
  },
  {
    title: 'Dance Video Sample',
    description: 'A sample dance video used as source input for motion-transfer demos.',
    drive_url: 'https://drive.google.com/file/d/1AxY1toJOmyy1cuqzCNJtsNAhWF1LBLHG/view',
    drive_file_id: '1AxY1toJOmyy1cuqzCNJtsNAhWF1LBLHG',
    category: 'Demo',
  },
];

async function seed() {
  // Remove rows that still carry the old fake placeholder file IDs.
  const { error: deleteError } = await supabase
    .from('videos')
    .delete()
    .in('drive_file_id', OLD_FAKE_IDS);

  if (deleteError) {
    console.error('Error deleting old placeholder videos:', deleteError);
    process.exit(1);
  }

  console.log('Cleaned up old placeholder videos with fake file IDs.');

  // Insert only videos that are not already present (avoids duplicates on re-run).
  const { data: existing, error: existingError } = await supabase
    .from('videos')
    .select('drive_file_id');

  if (existingError) {
    console.error('Error checking existing videos:', existingError);
    process.exit(1);
  }

  const existingIds = new Set((existing || []).map((v) => v.drive_file_id));
  const toInsert = sampleVideos.filter((v) => !existingIds.has(v.drive_file_id));

  if (toInsert.length === 0) {
    console.log('All sample videos already present. Nothing to seed.');
    process.exit(0);
  }

  const { data, error } = await supabase
    .from('videos')
    .insert(toInsert)
    .select();

  if (error) {
    console.error('Error seeding videos:', error);
    process.exit(1);
  }

  console.log(`
==============================================
  Seeded ${data.length} real video(s) from public
  Google Drive files ("Anyone with the link").

  Replace them with your own videos any time:
  https://video-hub-one-tawny.vercel.app/admin
  (files must be shared as "Anyone with the
  link can view" to play in the embed).
==============================================
`);
  process.exit(0);
}

seed();
