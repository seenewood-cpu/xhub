-- Run this in your Supabase Dashboard > SQL Editor
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow all operations (service role key bypasses RLS anyway)
CREATE POLICY "Allow all" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Seed with existing unique categories from videos
INSERT INTO categories (name)
SELECT DISTINCT category FROM videos
WHERE category IS NOT NULL AND category != ''
ON CONFLICT (name) DO NOTHING;
