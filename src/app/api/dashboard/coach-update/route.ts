import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAIChatCompletion } from '@/lib/ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the latest test attempt
    const { data: attempts, error: attemptsError } = await supabase
      .from('test_attempts')
      .select('*')
      .order('completed_at', { ascending: false })
      .limit(1);

    if (attemptsError) {
      console.error('Error fetching test attempts:', attemptsError);
      return NextResponse.json({ error: 'Failed to fetch test attempts' }, { status: 500 });
    }

    // Default note if no attempts exist yet
    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        feedback: "Welcome to ScorePath! Take your initial 15-minute diagnostic test so I can analyze your conceptual strengths, timing leaks, and custom GMAT study roadmap."
      });
    }

    const latestAttempt = attempts[0];

    // Fetch incorrect answers for this attempt
    const { data: incorrectAnswers, error: answersError } = await supabase
      .from('student_answers')
      .select('*, questions(*)')
      .eq('attempt_id', latestAttempt.id)
      .eq('is_correct', false);

    if (answersError) {
      console.error('Error fetching student answers:', answersError);
      return NextResponse.json({ error: 'Failed to fetch student answers' }, { status: 500 });
    }

    let feedback = "";

    try {
      const prompt = `You are the ScorePath GMAT AI Coach. A student named Devansh has completed their diagnostic/practice test.
Latest Attempt Details:
- Test Type: ${latestAttempt.test_type}
- Score: ${latestAttempt.score}%
- Count of Incorrect Questions: ${incorrectAnswers?.length || 0}
- Categories they got wrong: ${incorrectAnswers?.map(a => a.questions.category).join(', ') || 'None'}

Provide a highly personalized, tutor-like welcome greeting and advice. Keep it exactly 2 to 3 sentences. Be supportive, direct, and mention a specific study recommendation based on the categories they missed.`;

      feedback = await getAIChatCompletion({
        messages: [
          { role: 'user', content: prompt }
        ],
        systemInstruction: 'You are an encouraging GMAT AI study coach who outputs highly concise updates.'
      });

      if (!feedback) throw new Error('Empty response from AI');
    } catch (aiError) {
      console.warn('AI Coach Update failed or offline. Using high-fidelity local fallback:', aiError);

      if (incorrectAnswers && incorrectAnswers.length > 0) {
        const categories = Array.from(new Set(incorrectAnswers.map(a => a.questions.category)));
        const primaryCat = categories[0] || "Quantitative Reasoning";
        feedback = `Great work finishing your latest GMAT ${latestAttempt.test_type} set! Focus on revising your logic in ${primaryCat}—especially trap wording and pace traps which cost you points. I've logged the mistakes in your Error Log to practice.`;
      } else {
        feedback = `Incredible job! You scored a perfect 100% on your last GMAT ${latestAttempt.test_type} set. Your conceptual pacing and execution logic were flawless. Let's keep this momentum going with a mixed fix practice round.`;
      }
    }

    return NextResponse.json({ feedback });
  } catch (err: any) {
    console.error('AI Coach Update endpoint failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
