import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAIChatCompletion } from '@/lib/ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { question_id, selected_answer } = await request.json();

    if (!question_id) {
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

    let front = "";
    let back = "";

    try {
      const prompt = `Analyze this GMAT question the student got wrong:
Question: ${question.prompt}
Selected Wrong Answer: ${selected_answer || 'N/A'}
Correct Answer: ${question.correct_answer}
Official Explanation: ${question.explanation}

Generate a high-yield study flashcard to prevent this specific conceptual mistake in the future.
Front of Flashcard: A target question testing the core mathematical rule or verbal logic trap tested (keep it short and punchy, e.g. "What is the danger of multiplying an inequality by a variable?").
Back of Flashcard: The conceptual warning and GMAT solution (e.g. "You don't know the variable's sign! If negative, the inequality sign flips. Avoid multiplying unless you know the sign, or test values.").

You must respond ONLY with a JSON object in this exact format:
{
  "front": "Front of card",
  "back": "Back of card"
}`;

      const rawText = await getAIChatCompletion({
        messages: [
          { role: 'user', content: prompt }
        ],
        systemInstruction: 'You are an expert GMAT coach that outputs flashcard JSON objects.',
        responseFormat: 'json_object'
      });

      if (!rawText) throw new Error('Empty response from AI');
      const parsed = JSON.parse(rawText);
      front = parsed.front;
      back = parsed.back;
    } catch (aiError) {
      console.warn('AI Flashcard generation failed or offline. Using high-fidelity local fallback:', aiError);
      
      const isQuant = question.category?.includes("Quant") || question.category?.includes("Quantitative");
      
      if (isQuant) {
        front = "When solving algebraic inequalities, what is the risk of multiplying or dividing both sides by a variable?";
        back = "You don't know if the variable is positive or negative! If negative, the inequality sign must flip. Hack: Avoid multiplying variables across inequalities. Test positive and negative values instead.";
      } else {
        front = "How do GMAT Reading Comprehension questions trap students using passage claims?";
        back = "By converting qualified, soft claims (e.g., 'tends to', 'usually') into absolute claims (e.g., 'always', 'never') in incorrect choices. Hack: Scan for extreme words and eliminate them first.";
      }
    }

    // Save flashcard to the database
    const { data: savedCard, error: saveError } = await supabase
      .from('flashcards')
      .insert({
        question_id,
        front_content: front,
        back_content: back
      })
      .select('*')
      .single();

    if (saveError) {
      console.error('Error saving flashcard:', saveError);
      return NextResponse.json({ error: 'Failed to save generated flashcard' }, { status: 500 });
    }

    return NextResponse.json(savedCard);
  } catch (err: any) {
    console.error('AI Flashcard endpoint failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
