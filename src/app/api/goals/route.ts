import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goals: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, why, outcome, deadline, sacrifice, identity_statement, category } = body;

  if (!title || !why || !outcome || !deadline || !sacrifice || !identity_statement) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }

  const { data, error } = await supabase.from('goals').insert({
    user_id: user.id,
    title, why, outcome, deadline, sacrifice, identity_statement,
    category: category || 'general',
    status: 'active',
    progress: 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Create streak for this goal
  await supabase.from('streaks').insert({ user_id: user.id, goal_id: data.id });

  // Award XP for setting a goal
  const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single();
  if (profile) {
    await supabase.from('profiles').update({ xp: (profile.xp || 0) + 100 }).eq('id', user.id);
  }

  return NextResponse.json({ goal: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goal: data });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });

  const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
