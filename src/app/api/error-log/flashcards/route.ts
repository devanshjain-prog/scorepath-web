import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: cards, error } = await supabase
      .from('flashcards')
      .select('*, questions(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching flashcards:', error);
      return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 });
    }

    return NextResponse.json(cards);
  } catch (err: any) {
    console.error('Flashcards fetch failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
