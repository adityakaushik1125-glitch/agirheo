import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('scheduled_date', today);

    const totalTasks = tasks?.length || 0;
    const doneTasks = tasks?.filter(t => t.status === 'done').length || 0;
    const minimumTasks = tasks?.filter(t => t.is_minimum) || [];
    const minimumDone = minimumTasks.filter(t => t.status === 'done').length;
    const dayCompleted = totalTasks > 0 && (minimumTasks.length === 0 || minimumDone >= minimumTasks.length);

    const { data: streak } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .is('goal_id', null)
      .maybeSingle();

    const streakData: Array<{ date: string; completed: boolean; tasks_done: number }> =
      (streak?.streak_data as Array<{ date: string; completed: boolean; tasks_done: number }>) || [];

    const todayIndex = streakData.findIndex(d => d.date === today);
    if (todayIndex >= 0) {
      streakData[todayIndex] = { date: today, completed: dayCompleted, tasks_done: doneTasks };
    } else {
      streakData.push({ date: today, completed: dayCompleted, tasks_done: doneTasks });
    }

    // Calculate current streak (consecutive days ending today)
    const sorted = [...streakData].sort((a, b) => b.date.localeCompare(a.date));
    let currentStreak = 0;
    for (const day of sorted) {
      if (day.completed) currentStreak++;
      else break;
    }

    const bestStreak = Math.max(streak?.best_streak || 0, currentStreak);
    const failureCount = streakData.filter(d => !d.completed).length;

    if (streak) {
      await supabase.from('streaks').update({
        current_streak: currentStreak,
        best_streak: bestStreak,
        failure_count: failureCount,
        last_active_date: today,
        streak_data: streakData,
      }).eq('id', streak.id);
    } else {
      await supabase.from('streaks').insert({
        user_id: userId,
        current_streak: dayCompleted ? 1 : 0,
        best_streak: dayCompleted ? 1 : 0,
        failure_count: dayCompleted ? 0 : 1,
        last_active_date: today,
        streak_data: streakData,
      });
    }

    // Award XP for task completion
    const xpGain = doneTasks * 50;
    if (xpGain > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp, total_tasks_completed')
        .eq('id', userId)
        .single();

      if (profile) {
        const newXp = (profile.xp || 0) + xpGain;
        const newLevel = Math.floor(newXp / 1000) + 1;
        await supabase.from('profiles').update({
          xp: newXp,
          level: newLevel,
          total_tasks_completed: (profile.total_tasks_completed || 0) + doneTasks,
          days_active: currentStreak,
        }).eq('id', userId);
      }
    }

    return NextResponse.json({ success: true, currentStreak, bestStreak, dayCompleted });
  } catch (error) {
    console.error('Streak update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
