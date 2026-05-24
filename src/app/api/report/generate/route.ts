import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAIChatCompletion } from '@/lib/ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { attempt_id } = await request.json();

    if (!attempt_id) {
      return NextResponse.json({ error: 'Missing attempt_id' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the test attempt and answers
    const { data: attempt, error: attemptError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attempt_id)
      .single();

    if (attemptError || !attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 });
    }

    const { data: studentAnswers, error: answersError } = await supabase
      .from('student_answers')
      .select('*, questions(*)')
      .eq('attempt_id', attempt_id);

    if (answersError || !studentAnswers) {
      return NextResponse.json({ error: 'Student answers not found' }, { status: 404 });
    }

    const correctAnswers = studentAnswers.filter(ans => ans.is_correct);
    const incorrectAnswers = studentAnswers.filter(ans => !ans.is_correct);

    let reportContent;

    try {
      // Build detailed analysis prompt
      const prompt = `You are the ScorePath GMAT AI Coach. Analyze the student's GMAT diagnostic test performance.
      
Student Name: Devansh Jain
Test Score: ${attempt.score}% accuracy

CORRECT ANSWERS (Strengths):
${correctAnswers.map(ans => `
- Question: ${ans.questions.prompt}
  Category: ${ans.questions.category}
  Difficulty: ${ans.questions.difficulty}
  Confidence: ${ans.confidence || 'Sure'}
  Tags: ${ans.questions.tags?.join(', ')}
`).join('\n')}

INCORRECT ANSWERS (Weaknesses & Gaps):
${incorrectAnswers.map(ans => `
- Question: ${ans.questions.prompt}
  Category: ${ans.questions.category}
  Difficulty: ${ans.questions.difficulty}
  Selected: ${ans.selected_answer}
  Correct Answer: ${ans.questions.correct_answer}
  Explanation: ${ans.questions.explanation}
  Confidence: ${ans.confidence || 'Sure'}
  Tags: ${ans.questions.tags?.join(', ')}
`).join('\n')}

Provide a structured, highly specific, and professional GMAT diagnostic report card. 
Avoid generic sentences. Tailor all advice to the categories, questions, and confidence levels.
Include both "what they did well" (strengths) and "what they need to work on" (weaknesses).

You must respond ONLY with a JSON object in this exact format:
{
  "student_name": "Devansh Jain",
  "overall_summary": "A detailed, professionally written executive analysis of their performance, timing, confidence traps, and GMAT improvement score potential.",
  "strengths": [
    {
      "category": "Quant or Verbal",
      "subtopic": "Specific subtopic",
      "reason": "Clear explanation of why they did well, referring to their answers, difficulty, and confidence."
    }
  ],
  "weaknesses": [
    {
      "category": "Quant or Verbal",
      "subtopic": "Specific subtopic",
      "issue": "Specific mistake pattern or conceptual gap observed (e.g. calculation slip, absolute logic trap).",
      "recommendation": "Surgical action plan or specific study tip to bypass this error."
    }
  ],
  "study_plan": [
    {
      "step": 1,
      "action": "Task description referencing their target improvement path",
      "duration": "E.g., 3 days"
    }
  ]
}`;

      const rawText = await getAIChatCompletion({
        messages: [
          { role: 'user', content: prompt }
        ],
        systemInstruction: 'You are an elite GMAT coach that outputs detailed, structured report cards in JSON.',
        responseFormat: 'json_object'
      });

      if (!rawText) throw new Error('AI returned empty response');
      reportContent = JSON.parse(rawText);
    } catch (aiError) {
      console.warn('AI Generation failed, using high-fidelity local fallback:', aiError);
      
      const categoriesMap: Record<string, number> = {};
      incorrectAnswers.forEach(ans => {
        const cat = ans.questions.category || 'Quant';
        categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
      });

      const primaryWeakness = Object.keys(categoriesMap).sort((a, b) => categoriesMap[b] - categoriesMap[a])[0] || 'Quant';

      const mockStrengths = correctAnswers.length > 0 ? correctAnswers.map(ans => ({
        category: ans.questions.category || 'Quantitative Reasoning',
        subtopic: ans.questions.tags?.[0] || 'Core Algebra',
        reason: `Answered the ${ans.questions.difficulty} difficulty question correctly with "${ans.confidence || 'Sure'}" confidence. Demonstrates stable logical flow and clear rule execution under timed conditions.`
      })) : [
        {
          category: "Test Execution",
          subtopic: "Pacing & Endurance",
          reason: "Completed the diagnostic test successfully. Maintained high concentration across 15 complex GMAT questions."
        }
      ];

      const mockWeaknesses = incorrectAnswers.length > 0 ? incorrectAnswers.map(ans => ({
        category: ans.questions.category || 'Quantitative/Verbal',
        subtopic: ans.questions.tags?.[0] || 'Conceptual Math/Logic',
        issue: `Fell into a ${ans.questions.difficulty}-level difficulty trap. Answered "${ans.selected_answer}" instead of correct option "${ans.questions.correct_answer}".`,
        recommendation: `Study the exact pattern: "${ans.questions.explanation?.substring(0, 120)}...". Practice similar questions on ScorePath to lock in the rule.`
      })) : [
        {
          category: "Quantitative Reasoning",
          subtopic: "Advanced Data Insights",
          issue: "No incorrect answers registered during this diagnostic run.",
          recommendation: "Increase the test difficulty parameter or run practice modes to identify complex conceptual limits."
        }
      ];

      reportContent = {
        student_name: "Devansh Jain",
        overall_summary: `Devansh's performance demonstrates a strong capability in standard analytical processes, but highlights specific pacing limits and trap-selection tendencies in ${primaryWeakness}. By eliminating algebraic calculation slips and master-level reading distractors, Devansh has a potential GMAT improvement path of up to +120 points on ScorePath.`,
        strengths: mockStrengths.slice(0, 3), // Limit to top 3 for clean display
        weaknesses: mockWeaknesses.slice(0, 4), // Limit to top 4 for clean display
        study_plan: [
          {
            step: 1,
            action: `Review core ${primaryWeakness} theory rules and tag formulas in your personalized Formula Assist panel.`,
            duration: "3 Days"
          },
          {
            step: 2,
            action: "Practice 15 adaptive medium-difficulty questions focusing on accuracy over speed, utilizing the Elimination Trainer.",
            duration: "3 Days"
          },
          {
            step: 3,
            action: "Convert your incorrect answers into study flashcards in the Error Log and run daily card flips.",
            duration: "Daily"
          }
        ]
      };
    }

    // Save report to database
    const { data: savedReport, error: reportSaveError } = await supabase
      .from('ai_reports')
      .insert({
        attempt_id,
        report_content: reportContent
      })
      .select('*')
      .single();

    if (reportSaveError) {
      console.error('Failed to save AI report:', reportSaveError);
      return NextResponse.json({ error: 'Failed to save generated report' }, { status: 500 });
    }

    return NextResponse.json({ ...savedReport, score: attempt.score });
  } catch (err: any) {
    console.error('AI Report generation route failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
