-- Migration to add confidence field to student_answers table

ALTER TABLE student_answers 
ADD COLUMN IF NOT EXISTS confidence TEXT;
