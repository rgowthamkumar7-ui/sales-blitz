-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Set default password for existing users (first 3 letters of name in lowercase)
UPDATE users 
SET password = lower(substring(name from 1 for 3)) 
WHERE password IS NULL;
