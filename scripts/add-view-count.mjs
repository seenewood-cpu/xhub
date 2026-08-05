import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { error } = await supabase.rpc('exec_sql', {
  query: 'ALTER TABLE videos ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;'
});

if (error) {
  // Try direct approach via REST
  console.log('RPC failed, trying via SQL editor approach...');
  console.log('Run this SQL in Supabase SQL Editor:');
  console.log('ALTER TABLE videos ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;');
  process.exit(1);
}

console.log('view_count column added successfully');
