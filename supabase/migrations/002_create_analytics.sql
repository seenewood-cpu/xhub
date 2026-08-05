-- Run this in your Supabase Dashboard > SQL Editor

-- Track page visits, video views, and searches
CREATE TABLE IF NOT EXISTS analytics (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON analytics FOR ALL USING (true) WITH CHECK (true);

-- Track search queries
CREATE TABLE IF NOT EXISTS searches (
  id BIGSERIAL PRIMARY KEY,
  query TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON searches FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics(country);
CREATE INDEX IF NOT EXISTS idx_searches_query ON searches(query);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at);
