import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .eq('scheduled_date', date)
    .order('is_critical', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tasks: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase.from('tasks').insert({
    user_id: user.id,
    title: body.title,
    description: body.description || null,
    is_critical: body.is_critical || false,
    is_minimum: body.is_minimum || false,
    focus_duration: body.focus_duration || 25,
    goal_id: body.goal_id || null,
    scheduled_date: body.scheduled_date || today,
    status: 'pending',
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ task: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, status, actual_duration } = body;

  const updates: Record<string, unknown> = { status };
  if (status === 'done') updates.completed_at = new Date().toISOString();
  if (actual_duration) updates.actual_duration = actual_duration;

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // XP reward on completion
  if (status === 'done') {
    const { data: profile } = await supabase.from('profiles').select('xp, total_tasks_completed').eq('id', user.id).single();
    if (profile) {
      const newXp = (profile.xp || 0) + 50;
      await supabase.from('profiles').update({
        xp: newXp,
        level: Math.floor(newXp / 1000) + 1,
        total_tasks_completed: (profile.total_tasks_completed || 0) + 1,
      }).eq('id', user.id);
    }
  } else if (status === 'failed') {
    const { data: profile } = await supabase.from('profiles').select('total_failures').eq('id', user.id).single();
    if (profile) {
      await supabase.from('profiles').update({
        total_failures: (profile.total_failures || 0) + 1,
      }).eq('id', user.id);
    }
  }

  return NextResponse.json({ task: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Task ID required' }, { status: 400 });

  const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
