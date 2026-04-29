-- ============================================================
-- TechPulse – Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  image        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ARTICLES ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  excerpt      TEXT,
  url          TEXT UNIQUE NOT NULL,
  source       TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  category     TEXT NOT NULL DEFAULT 'Tech Updates'
                 CHECK (category IN (
                   'Tech Updates',
                   'Artificial Intelligence',
                   'Digital Marketing',
                   'Social Media',
                   'Research & Papers',
                   'Tech & Human Life'
                 )),
  image        TEXT,
  read_time    INT NOT NULL DEFAULT 3,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS articles_category_idx ON articles (category);
CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles (published_at DESC);
CREATE INDEX IF NOT EXISTS articles_created_at_idx ON articles (created_at DESC);
CREATE INDEX IF NOT EXISTS articles_title_tsvector_idx
  ON articles USING GIN (to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- ─── SAVED ARTICLES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_articles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  notes      TEXT,
  tags       TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, article_id)
);

CREATE INDEX IF NOT EXISTS saved_articles_user_id_idx ON saved_articles (user_id);

-- ─── APP METADATA ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_metadata (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_metadata (key, value)
  VALUES ('last_refreshed', NOW()::TEXT)
  ON CONFLICT (key) DO NOTHING;

-- ─── AUTO-UPDATE updated_at ──────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Articles are publicly readable" ON articles;
CREATE POLICY "Articles are publicly readable"
  ON articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage articles" ON articles;
CREATE POLICY "Service role can manage articles"
  ON articles FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Users can view own saved articles" ON saved_articles;
CREATE POLICY "Users can view own saved articles"
  ON saved_articles FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Users can manage own saved articles" ON saved_articles;
CREATE POLICY "Users can manage own saved articles"
  ON saved_articles FOR ALL
  USING (user_id = (SELECT id FROM users WHERE email = auth.jwt()->>'email'));

DROP POLICY IF EXISTS "App metadata is publicly readable" ON app_metadata;
CREATE POLICY "App metadata is publicly readable"
  ON app_metadata FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage app metadata" ON app_metadata;
CREATE POLICY "Service role can manage app metadata"
  ON app_metadata FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users"
  ON users FOR ALL USING (auth.role() = 'service_role');
