import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: Request) {
  try {
    const { attempt_id, student_name, student_email, preferred_time, notes } = await request.json();

    if (!student_name || !student_email || !preferred_time) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: booking, error: dbError } = await supabase
      .from('tutor_requests')
      .insert({
        attempt_id: attempt_id || null,
        student_name,
        student_email,
        preferred_time,
        notes: notes || '',
        status: 'pending'
      })
      .select('*')
      .single();

    if (dbError || !booking) {
      console.error('Error inserting tutor request:', dbError);
      return NextResponse.json({ error: 'Failed to submit booking request' }, { status: 500 });
    }

    return NextResponse.json(booking);
  } catch (err: any) {
    console.error('Booking submission failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
