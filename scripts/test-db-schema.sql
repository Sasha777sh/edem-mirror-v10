-- Test script to verify the session_feedback table schema
-- This script checks if the table exists and has the correct structure

-- Check if the table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'session_feedback'
);

-- Check the structure of the table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'session_feedback'
ORDER BY ordinal_position;

-- Check if indexes exist
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'session_feedback';