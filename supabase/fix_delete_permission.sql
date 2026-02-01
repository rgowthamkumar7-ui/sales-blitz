-- Allow deletion of old users
CREATE POLICY "Allow delete" ON users FOR DELETE USING (true);
