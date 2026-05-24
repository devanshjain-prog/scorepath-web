import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();
    const { attempt_id, question_id, selected_answer, confidence, time_spent_seconds, auto_submit } = body;

    if (!attempt_id) {
      return NextResponse.json({ error: 'Missing attempt_id' }, { status: 400 });
    }

    // 1. Fetch current attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attempt_id)
      .single();

    if (attemptError || !attempt) {
      console.error('Attempt not found:', attemptError);
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    // 2. Check if this is an auto-submit triggered by timer expiration
    if (auto_submit) {
      // Get count of answers already submitted
      const { count, error: countError } = await supabase
        .from('student_answers')
        .select('*', { count: 'exact', head: true })
        .eq('attempt_id', attempt_id);

      const answeredCount = count || 0;
      const remainingQuestions = Math.max(0, 15 - answeredCount);

      // GMAT penalty: decrease score for each unanswered question
      let finalScore = attempt.score || 500;
      finalScore -= remainingQuestions * 40; 
      
      // Bound between 200 and 800
      finalScore = Math.max(200, Math.min(800, finalScore));
      finalScore = Math.round(finalScore / 10) * 10; // Round to nearest 10

      // Update attempt as completed
      await supabase
        .from('test_attempts')
        .update({
          score: finalScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', attempt_id);

      return NextResponse.json({ finished: true, score: finalScore });
    }

    if (!question_id || !selected_answer) {
      return NextResponse.json({ error: 'Missing question_id or selected_answer' }, { status: 400 });
    }

    // 3. Verify answer correctness
    const { data: question, error: qError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (qError || !question) {
      console.error('Question not found:', qError);
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    const isCorrect = question.correct_answer === selected_answer;

    // 4. Record student's response in student_answers
    const { error: insertError } = await supabase
      .from('student_answers')
      .insert({
        attempt_id,
        question_id,
        selected_answer,
        is_correct: isCorrect,
        confidence: confidence || 'Sure',
        time_spent_seconds: time_spent_seconds || 30
      });

    if (insertError) {
      console.error('Failed to save student answer:', insertError);
      return NextResponse.json({ error: 'Failed to record answer' }, { status: 500 });
    }

    // Add to error log if incorrect
    if (!isCorrect) {
      await supabase
        .from('error_log')
        .insert({
          question_id,
          reasoning_error_type: confidence === 'Guessed' ? 'Guessing trap' : 'Conceptual slip'
        });
    }

    // 5. Update GMAT Adaptive Score
    let currentScore = attempt.score || 500;
    const diff = question.difficulty;

    if (isCorrect) {
      if (diff === 'Easy') currentScore += 30;
      else if (diff === 'Medium') currentScore += 40;
      else if (diff === 'Hard') currentScore += 50;
    } else {
      if (diff === 'Easy') currentScore -= 50;
      else if (diff === 'Medium') currentScore -= 40;
      else if (diff === 'Hard') currentScore -= 30;
    }

    // Bound between 200 and 800
    currentScore = Math.max(200, Math.min(800, currentScore));
    currentScore = Math.round(currentScore / 10) * 10; // Round to nearest 10

    // Fetch total completed questions
    const { data: allAnswers, error: listError } = await supabase
      .from('student_answers')
      .select('question_id')
      .eq('attempt_id', attempt_id);

    if (listError || !allAnswers) {
      console.error('Failed to list answered questions:', listError);
      return NextResponse.json({ error: 'Failed to evaluate test progress' }, { status: 500 });
    }

    const completedCount = allAnswers.length;

    // Check if test is finished
    if (completedCount >= 15) {
      await supabase
        .from('test_attempts')
        .update({
          score: currentScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', attempt_id);

      return NextResponse.json({ finished: true, score: currentScore });
    }

    // Update attempt's running score
    await supabase
      .from('test_attempts')
      .update({ score: currentScore })
      .eq('id', attempt_id);

    // 6. Fetch Next Question Adaptively
    // Determine next target difficulty based on ability
    let targetDifficulty = 'Medium';
    if (currentScore < 450) {
      targetDifficulty = 'Easy';
    } else if (currentScore >= 650) {
      targetDifficulty = 'Hard';
    }

    const answeredIds = allAnswers.map(ans => ans.question_id);

    // Helper to query un-answered questions of a specific difficulty
    const getQuestionsByDifficulty = async (diffLevel: string) => {
      const { data } = await supabase
        .from('questions')
        .select('id, category, difficulty, prompt, options')
        .eq('difficulty', diffLevel)
        .not('id', 'in', `(${answeredIds.join(',')})`);
      return data || [];
    };

    // Try target difficulty first
    let candidates = await getQuestionsByDifficulty(targetDifficulty);

    // Fallbacks if no un-answered questions exist in the target difficulty
    if (candidates.length === 0) {
      const fallbackList = targetDifficulty === 'Easy' 
        ? ['Medium', 'Hard'] 
        : targetDifficulty === 'Hard' 
          ? ['Medium', 'Easy'] 
          : ['Hard', 'Easy'];

      for (const fallbackDiff of fallbackList) {
        candidates = await getQuestionsByDifficulty(fallbackDiff);
        if (candidates.length > 0) break;
      }
    }

    // Safety fallback: if somehow absolutely all questions are exhausted, fetch any un-answered question
    if (candidates.length === 0) {
      const { data } = await supabase
        .from('questions')
        .select('id, category, difficulty, prompt, options')
        .not('id', 'in', `(${answeredIds.join(',')})`);
      candidates = data || [];
    }

    // Select a random candidate
    if (candidates.length === 0) {
      // In the worst case, if the pool has fewer than 15 total questions, let them finish
      await supabase
        .from('test_attempts')
        .update({
          score: currentScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', attempt_id);

      return NextResponse.json({ finished: true, score: currentScore });
    }

    const nextQ = candidates[Math.floor(Math.random() * candidates.length)];

    return NextResponse.json({
      finished: false,
      question: nextQ,
      step: completedCount + 1,
      score: currentScore
    });
  } catch (err: any) {
    console.error('Answer diagnostic failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
