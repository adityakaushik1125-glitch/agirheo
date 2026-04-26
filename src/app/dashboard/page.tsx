import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const today = new Date().toISOString().split('T')[0];

  const [
    { data: profile },
    { data: goals },
    { data: todayTasks },
    { data: streak },
    { data: recentLog },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }),
    supabase.from('tasks').select('*').eq('user_id', user.id).eq('scheduled_date', today).order('is_critical', { ascending: false }),
    supabase.from('streaks').select('*').eq('user_id', user.id).is('goal_id', null).single(),
    supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).single(),
  ]);

  const tasksDone = todayTasks?.filter(t => t.status === 'done').length || 0;
  const tasksFailed = todayTasks?.filter(t => t.status === 'failed').length || 0;
  const tasksTotal = todayTasks?.length || 0;
  const minimumTasks = todayTasks?.filter(t => t.is_minimum) || [];
  const minimumDone = minimumTasks.filter(t => t.status === 'done').length;

  return (
    <DashboardClient
      profile={profile}
      goals={goals || []}
      todayTasks={todayTasks || []}
      streak={streak}
      recentLog={recentLog}
      stats={{ tasksDone, tasksFailed, tasksTotal, minimumDone, minimumTotal: minimumTasks.length }}
      userId={user.id}
    />
  );
}
