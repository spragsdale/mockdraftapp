-- Add scoring_categories column to leagues table
ALTER TABLE leagues 
ADD COLUMN IF NOT EXISTS scoring_categories JSONB DEFAULT '{"hitters": ["RBI", "Runs", "SB", "HR", "OBP", "SLG"], "pitchers": ["W+QS", "ERA", "WHIP", "SO", "K/9", "SV+HLD"]}'::JSONB;

-- Update existing leagues to have default scoring categories if they don't have them
UPDATE leagues 
SET scoring_categories = '{"hitters": ["RBI", "Runs", "SB", "HR", "OBP", "SLG"], "pitchers": ["W+QS", "ERA", "WHIP", "SO", "K/9", "SV+HLD"]}'::JSONB
WHERE scoring_categories IS NULL;

