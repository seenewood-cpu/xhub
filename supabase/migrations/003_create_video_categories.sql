-- Run this in your Supabase Dashboard > SQL Editor
-- Creates a many-to-many relationship between videos and categories

CREATE TABLE IF NOT EXISTS video_categories (
  video_id BIGINT REFERENCES videos(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, category_id)
);

-- Migrate existing single-category data to junction table
INSERT INTO video_categories (video_id, category_id)
SELECT v.id, c.id
FROM videos v
JOIN categories c ON v.category = c.name
WHERE v.category IS NOT NULL AND v.category != ''
ON CONFLICT DO NOTHING;
