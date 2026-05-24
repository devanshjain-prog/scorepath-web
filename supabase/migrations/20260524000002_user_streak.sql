-- 20260524000002_user_streak.sql
-- Add streak count and last active date tracking to user profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0 NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_date DATE;
