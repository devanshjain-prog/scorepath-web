import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all student answers that are incorrect, along with the question details
    const { data: mistakes, error: dbError } = await supabase
      .from('student_answers')
      .select('*, questions(*)')
      .eq('is_correct', false)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Error fetching mistakes:', dbError);
      return NextResponse.json({ error: 'Failed to fetch error log' }, { status: 500 });
    }

    return NextResponse.json(mistakes);
  } catch (err: any) {
    console.error('Error log fetch failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
