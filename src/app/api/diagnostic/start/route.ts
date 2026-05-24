import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Create a new test attempt at baseline 500 score
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        test_type: 'diagnostic',
        score: 500, // baseline GMAT ability score
      })
      .select('id')
      .single();

    if (attemptError || !attempt) {
      console.error('Failed to create adaptive attempt:', attemptError);
      return NextResponse.json({ error: 'Failed to start diagnostic test' }, { status: 500 });
    }

    // 2. Fetch a baseline Medium difficulty question
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('id, category, difficulty, prompt, options')
      .eq('difficulty', 'Medium');

    if (qError || !questions || questions.length === 0) {
      console.error('Failed to fetch initial Medium question:', qError);
      return NextResponse.json({ error: 'Failed to retrieve GMAT questions' }, { status: 500 });
    }

    // Choose a random question from the Medium list
    const randomIndex = Math.floor(Math.random() * questions.length);
    const initialQuestion = questions[randomIndex];

    return NextResponse.json({
      attempt_id: attempt.id,
      question: initialQuestion,
      step: 1
    });
  } catch (err: any) {
    console.error('Start diagnostic failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
