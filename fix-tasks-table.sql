-- Fix tasks table structure
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zggnnptxudksjidlnsha/sql

-- Check if description column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tasks' 
        AND column_name = 'description'
    ) THEN
        -- Add description column if it doesn't exist
        ALTER TABLE tasks ADD COLUMN description TEXT;
        RAISE NOTICE 'Added description column to tasks table';
    ELSE
        RAISE NOTICE 'Description column already exists';
    END IF;
END $$;

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tasks'
ORDER BY ordinal_position;
