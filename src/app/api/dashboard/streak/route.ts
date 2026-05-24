import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('streak_count, last_active_date')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    let currentStreak = profile.streak_count || 0;
    const lastActive = profile.last_active_date;

    if (lastActive === todayStr) {
      // Already active today, streak is maintained
      return NextResponse.json({ streak_count: currentStreak, last_active_date: todayStr });
    }

    if (lastActive) {
      const today = new Date(todayStr);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActive === yesterdayStr) {
        // Active yesterday, increment streak
        currentStreak += 1;
      } else {
        // Missed a day, reset streak to 1
        currentStreak = 1;
      }
    } else {
      // First time active, set streak to 1
      currentStreak = 1;
    }

    // Update profile in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        streak_count: currentStreak,
        last_active_date: todayStr
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ streak_count: currentStreak, last_active_date: todayStr });
  } catch (err: any) {
    console.error('Streak update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
