-- Run this in your Supabase Dashboard > SQL Editor
-- Creates like/dislike reactions for videos

CREATE TABLE IF NOT EXISTS video_reactions (
  id BIGSERIAL PRIMARY KEY,
  video_id BIGINT REFERENCES videos(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('like', 'dislike')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(video_id, user_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_video_reactions_video_id ON video_reactions(video_id);

ALTER TABLE video_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON video_reactions FOR ALL USING (true) WITH CHECK (true);
