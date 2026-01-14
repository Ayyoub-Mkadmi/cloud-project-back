-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_urls JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
