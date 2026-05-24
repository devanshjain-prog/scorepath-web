import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { answers } = await request.json(); // Record<question_id, { selected_answer: string, confidence: string }>
    
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const questionIds = Object.keys(answers);
    if (questionIds.length === 0) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    // Fetch correct answers for validation
    const { data: dbQuestions, error: dbError } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .in('id', questionIds);

    if (dbError || !dbQuestions) {
      console.error('Error fetching questions for validation:', dbError);
      return NextResponse.json({ error: 'Failed to fetch questions for validation' }, { status: 500 });
    }

    // Calculate score
    let score = 0;
    const studentAnswersToInsert = dbQuestions.map(q => {
      const answerVal = answers[q.id];
      const selected = typeof answerVal === 'string' ? answerVal : answerVal?.selected_answer;
      const confidence = typeof answerVal === 'string' ? 'Sure' : answerVal?.confidence || 'Sure';
      const isCorrect = q.correct_answer === selected;
      if (isCorrect) score += 1;

      return {
        question_id: q.id,
        selected_answer: selected,
        is_correct: isCorrect,
        confidence,
        time_spent_seconds: Math.floor(Math.random() * 40) + 20 // Mock time spent
      };
    });

    // Create test attempt
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        test_type: 'practice',
        score: Math.round((score / dbQuestions.length) * 100),
        completed_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (attemptError || !attempt) {
      console.error('Error creating attempt:', attemptError);
      return NextResponse.json({ error: 'Failed to create test attempt' }, { status: 500 });
    }

    // Insert student answers linked to attempt
    const answersWithAttemptId = studentAnswersToInsert.map(ans => ({
      ...ans,
      attempt_id: attempt.id
    }));

    const { error: insertAnswersError } = await supabase
      .from('student_answers')
      .insert(answersWithAttemptId);

    if (insertAnswersError) {
      console.error('Error inserting answers:', insertAnswersError);
      return NextResponse.json({ error: 'Failed to save student answers' }, { status: 500 });
    }

    return NextResponse.json({ attempt_id: attempt.id, score: Math.round((score / dbQuestions.length) * 100) });
  } catch (err: any) {
    console.error('Practice submission failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
