-- Run this in Supabase SQL Editor to allow the update script to modify data

-- Users Table
CREATE POLICY "Allow insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update" ON users FOR UPDATE USING (true);

-- Distributors Table
CREATE POLICY "Allow update" ON distributors FOR UPDATE USING (true);
CREATE POLICY "Allow insert" ON distributors FOR INSERT WITH CHECK (true);

-- Manager Mappings
CREATE POLICY "Allow delete" ON manager_distributors FOR DELETE USING (true);
CREATE POLICY "Allow insert" ON manager_distributors FOR INSERT WITH CHECK (true);
