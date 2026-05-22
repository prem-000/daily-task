-- Add Missing Columns to Tasks Table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zggnnptxudksjidlnsha/sql

-- Add description column (the one causing the error)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;

-- Add other potentially missing columns
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'Other';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_time TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Verify all columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;

-- Show success message
DO $$ 
BEGIN
    RAISE NOTICE '✅ All columns added successfully!';
    RAISE NOTICE 'Refresh your app and try adding a task again.';
END $$;
