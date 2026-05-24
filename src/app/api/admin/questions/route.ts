import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    return NextResponse.json(questions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, review_status, prompt, category, difficulty, options, correct_answer, explanation } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing question id' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const updatePayload: any = {};
    if (review_status !== undefined) updatePayload.review_status = review_status;
    if (prompt !== undefined) updatePayload.prompt = prompt;
    if (category !== undefined) updatePayload.category = category;
    if (difficulty !== undefined) updatePayload.difficulty = difficulty;
    if (options !== undefined) updatePayload.options = options;
    if (correct_answer !== undefined) updatePayload.correct_answer = correct_answer;
    if (explanation !== undefined) updatePayload.explanation = explanation;

    const { data: updatedQuestion, error } = await supabase
      .from('questions')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating question details:', error);
      return NextResponse.json({ error: 'Failed to update question details' }, { status: 500 });
    }

    return NextResponse.json(updatedQuestion);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
