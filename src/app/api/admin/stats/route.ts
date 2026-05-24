import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch total attempts
    const { count: attemptsCount, error: attemptsError } = await supabase
      .from('test_attempts')
      .select('*', { count: 'exact', head: true });

    // Fetch tutor requests
    const { count: tutorCount, error: tutorError } = await supabase
      .from('tutor_requests')
      .select('*', { count: 'exact', head: true });

    // Fetch questions breakdown
    const { data: questions, error: qError } = await supabase
      .from('questions')
      .select('review_status');

    if (attemptsError || tutorError || qError) {
      console.error({ attemptsError, tutorError, qError });
      return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
    }

    const reviewStatusCounts: Record<string, number> = {
      approved: 0,
      needs_review: 0,
      draft: 0,
      retired: 0
    };

    questions?.forEach(q => {
      const status = q.review_status || 'needs_review';
      reviewStatusCounts[status] = (reviewStatusCounts[status] || 0) + 1;
    });

    return NextResponse.json({
      attempts: attemptsCount || 0,
      tutor_requests: tutorCount || 0,
      questions: {
        total: questions?.length || 0,
        ...reviewStatusCounts
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
