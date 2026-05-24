-- 20260524000003_open_policies.sql
-- Create open policies for the local sandbox development environment

CREATE POLICY "Profiles can be managed by anyone" ON profiles FOR ALL USING (true);
CREATE POLICY "Test attempts can be managed by anyone" ON test_attempts FOR ALL USING (true);
CREATE POLICY "Student answers can be managed by anyone" ON student_answers FOR ALL USING (true);
CREATE POLICY "AI reports can be managed by anyone" ON ai_reports FOR ALL USING (true);
CREATE POLICY "Error logs can be managed by anyone" ON error_log FOR ALL USING (true);
