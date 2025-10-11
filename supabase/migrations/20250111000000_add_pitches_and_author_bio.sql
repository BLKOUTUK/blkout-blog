-- Add author_bio column to voices_articles if it doesn't exist
ALTER TABLE voices_articles
ADD COLUMN IF NOT EXISTS author_bio TEXT DEFAULT '';

-- Create voices_pitches table for article pitch submissions
CREATE TABLE IF NOT EXISTS voices_pitches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  pitch TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_bio TEXT DEFAULT '',
  category TEXT DEFAULT 'opinion',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_pitches_status ON voices_pitches(status);
CREATE INDEX IF NOT EXISTS idx_pitches_submitted_at ON voices_pitches(submitted_at DESC);

-- Enable Row Level Security
ALTER TABLE voices_pitches ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert pitches (public submission)
CREATE POLICY "Anyone can submit pitches"
  ON voices_pitches
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only allow reading pitches with service role key (admin only)
CREATE POLICY "Only service role can read pitches"
  ON voices_pitches
  FOR SELECT
  TO service_role
  USING (true);

-- Only allow updating pitches with service role key (admin only)
CREATE POLICY "Only service role can update pitches"
  ON voices_pitches
  FOR UPDATE
  TO service_role
  USING (true);

-- Add comment
COMMENT ON TABLE voices_pitches IS 'Article pitch submissions from community members';
