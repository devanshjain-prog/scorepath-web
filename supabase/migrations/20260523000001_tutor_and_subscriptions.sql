-- Migration to add tutor_requests table for GMAT Coaching Requests

CREATE TABLE IF NOT EXISTS tutor_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES test_attempts(id) ON DELETE SET NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    preferred_time TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE tutor_requests ENABLE ROW LEVEL SECURITY;

-- Allow public inserts for guest bookings
CREATE POLICY "Anyone can create a tutor request" ON tutor_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Tutor requests viewable by everyone in dev" ON tutor_requests FOR SELECT USING (true);
