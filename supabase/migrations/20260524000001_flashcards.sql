-- Migration to add flashcards table for storing AI-generated study cards

CREATE TABLE IF NOT EXISTS flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    front_content TEXT NOT NULL,
    back_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Set up open security policies for local sandbox environment
CREATE POLICY "Flashcards are viewable by everyone" ON flashcards FOR SELECT USING (true);
CREATE POLICY "Flashcards can be managed by anyone" ON flashcards FOR ALL USING (true);
