import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { rows } = await request.json(); // Array of parsed CSV question rows

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid rows format. Must be an array.' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const questionsToInsert = rows.map(row => {
      // Handle potential header mappings
      const category = row.topic || row.section || row.category || 'General';
      const difficulty = row.difficulty || 'Medium';
      const prompt = row.question_text || row.prompt || '';
      
      const option_a = row.option_a || '';
      const option_b = row.option_b || '';
      const option_c = row.option_c || '';
      const option_d = row.option_d || '';
      const option_e = row.option_e || '';

      const optionsList = [
        { id: 'A', text: option_a },
        { id: 'B', text: option_b },
        { id: 'C', text: option_c },
        { id: 'D', text: option_d },
        { id: 'E', text: option_e }
      ].filter(o => o.text);

      const correct_answer = row.correct_answer || 'A';
      const explanation = row.step_by_step_explanation || row.simple_explanation || row.explanation || '';
      
      const tags = [
        row.skills_tested,
        row.formula_tags,
        row.method_tags,
        row.trap_type
      ].filter(Boolean);

      return {
        category,
        difficulty,
        prompt,
        options: optionsList,
        correct_answer,
        explanation,
        tags,
        review_status: 'needs_review',
        source_type: row.source_type || 'ai_drafted'
      };
    }).filter(q => q.prompt); // filter empty rows

    if (questionsToInsert.length === 0) {
      return NextResponse.json({ error: 'No valid questions found to import' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('questions')
      .insert(questionsToInsert);

    if (error) {
      console.error('Error importing questions:', error);
      return NextResponse.json({ error: 'Failed to insert questions into database' }, { status: 500 });
    }

    return NextResponse.json({ count: questionsToInsert.length });
  } catch (err: any) {
    console.error('Question import failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
