-- Migration to add admin-centric fields to the questions table

ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'needs_review' NOT NULL,
ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'original' NOT NULL;
