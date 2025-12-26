-- Add separate survey_votes column to track casual interest
ALTER TABLE wants ADD COLUMN IF NOT EXISTS survey_votes INTEGER DEFAULT 0;
