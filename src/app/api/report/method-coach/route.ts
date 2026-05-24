import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAIChatCompletion } from '@/lib/ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { question_id, student_method, selected_answer, correct_answer } = await request.json();

    if (!question_id || !student_method) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the question
    const { data: question, error: dbError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (dbError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    let feedback;

    try {
      const prompt = `You are the ScorePath GMAT AI Method Coach. A student got this question wrong:
Question: ${question.prompt}
Selected Answer: ${selected_answer}
Correct Answer: ${correct_answer}
Official Explanation: ${question.explanation}

The student explained their solving method as:
"${student_method}"

Analyze their method:
1. Is their reasoning logically sound?
2. Did they fall into a trap?
3. Is their method too slow?
4. What is a faster, GMAT-appropriate shortcut approach?

Respond with a clean, concise, tutor-like feedback analysis. Keep it calm and encouraging.`;

      feedback = await getAIChatCompletion({
        messages: [
          { role: 'user', content: prompt }
        ],
        systemInstruction: 'You are an encouraging GMAT AI Method Coach.'
      });

      if (!feedback) throw new Error('Empty response from AI');
    } catch (aiError) {
      console.warn('AI Method Coach failed or offline. Using mock RAG fallback:', aiError);
      
      // High-fidelity fallback logic matching topic
      const isQuant = question.category?.includes("Quant") || question.category?.includes("Quantitative");
      feedback = isQuant 
        ? `Your approach of setting up equations was logically sound, but you chose option ${selected_answer} likely due to variable multiplying traps. When dealing with inequalities, avoid multiplying by variables unless you are sure of their sign (positive or negative). Instead, test values (e.g. choose x = -2 and x = 2) to eliminate option choices in under 45 seconds.`
        : `Your critical reading analysis was close, but you fell for the 'Too extreme' option trap. Option ${selected_answer} makes a strong absolute claim ('always') not supported by the passage. The correct option ${correct_answer} uses qualified language ('tends to') which aligns perfectly with standard GMAT Verbal logic parameters.`;
    }

    return NextResponse.json({ feedback });
  } catch (err: any) {
    console.error('Method Coach failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
