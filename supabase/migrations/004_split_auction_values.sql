-- Update import_history table to support separate hitter and pitcher auction values
-- First, handle existing 'auction_values' records by converting them to 'hitter_auction_values'
-- (We can't determine if they were hitter or pitcher, so defaulting to hitter)
-- Temporarily disable the constraint check for this update
ALTER TABLE import_history DROP CONSTRAINT IF EXISTS import_history_import_type_check;

-- Update existing records
UPDATE import_history 
SET import_type = 'hitter_auction_values' 
WHERE import_type = 'auction_values';

-- Add the new constraint with updated import types
ALTER TABLE import_history 
ADD CONSTRAINT import_history_import_type_check 
CHECK (import_type IN ('hitter_projections', 'pitcher_projections', 'hitter_auction_values', 'pitcher_auction_values'));

