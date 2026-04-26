'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Task, Goal } from '@/types';
import {
  Zap, Plus, CheckCircle2, XCircle, Clock, Timer,
  Flame, AlertTriangle, Play, Pause, RotateCcw, X, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface TaskForm {
  title: string;
  description: string;
  is_critical: boolean;
  is_minimum: boolean;
  focus_duration: number;
  goal_id: string;
}

const defaultTaskForm: TaskForm = {
  title: '', description: '', is_critical: false, is_minimum: false, focus_duration: 25, goal_id: ''
};

export default function MissionSystemPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TaskForm>(defaultTaskForm);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [activeTimer, setActiveTimer] = useState<{ taskId: string; remaining: number; running: boolean } | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTimer?.running) {
      timerRef.current = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev) return null;
          if (prev.remaining <= 1) {
            clearInterval(timerRef.current!);
            toast.success('⚡ Focus session complete! Mark your task.');
            return { ...prev, remaining: 0, running: false };
          }
          return { ...prev, remaining: prev.remaining - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeTimer?.running]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const [{ data: tasksData }, { data: goalsData }] = await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('scheduled_date', today).order('is_critical', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
    ]);
    if (tasksData) setTasks(tasksData);
    if (goalsData) setGoals(goalsData);
  };

  const handleAddTask = async () => {
    if (!form.title.trim()) { toast.error('Give your task a name.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('tasks').insert({
        ...form,
        user_id: userId,
        scheduled_date: today,
        goal_id: form.goal_id || null,
      });
      if (error) throw error;
      toast.success('Task added to mission.');
      setShowForm(false);
      setForm(defaultTaskForm);
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatus = async (taskId: string, status: 'done' | 'failed') => {
    await supabase.from('tasks').update({
      status,
      completed_at: status === 'done' ? new Date().toISOString() : null,
    }).eq('id', taskId);

    if (status === 'done') {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp, total_tasks_completed')
      .eq('id', userId)
      .single();
    if (profile) {
      await supabase
        .from('profiles')
        .update({ 
          xp: (profile.xp || 0) + 50,
          total_tasks_completed: (profile.total_tasks_completed || 0) + 1
        })
        .eq('id', userId);
    }
  } catch {}
}

    if (activeTimer?.taskId === taskId) setActiveTimer(null);
    loadData();
  };

  const startTimer = (task: Task) => {
    setActiveTimer({ taskId: task.id, remaining: task.focus_duration * 60, running: true });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const criticalTasks = tasks.filter(t => t.is_critical);
  const minimumTasks = tasks.filter(t => t.is_minimum && !t.is_critical);
  const regularTasks = tasks.filter(t => !t.is_critical && !t.is_minimum);
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const minimumDone = tasks.filter(t => t.is_minimum && t.status === 'done').length;
  const minimumTotal = tasks.filter(t => t.is_minimum).length;

  const renderTask = (task: Task) => (
    <motion.div
      key={task.id}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'rounded-lg border transition-all',
        task.status === 'done' ? 'bg-neon/5 border-neon/15' :
        task.status === 'failed' ? 'bg-fire/5 border-fire/15' :
        activeTimer?.taskId === task.id ? 'bg-ember/10 border-ember/40 ember-glow' :
        'bg-iron/30 border-white/8 hover:border-white/15'
      )}
    >
      <div className="p-4 flex items-start gap-3">
        <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
          {task.status === 'done' ? (
            <CheckCircle2 className="w-5 h-5 text-neon" />
          ) : task.status === 'failed' ? (
            <XCircle className="w-5 h-5 text-fire" />
          ) : (
            <Clock className="w-5 h-5 text-ash" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className={cn('font-heading font-semibold text-sm', {
            'text-neon/70 line-through': task.status === 'done',
            'text-fire/70 line-through': task.status === 'failed',
            'text-snow': task.status === 'pending',
          })}>
            {task.title}
          </div>
          {task.description && (
            <p className="text-xs text-ash mt-0.5 line-clamp-1">{task.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {task.is_critical && <span className="badge-failed text-xs px-2 py-0.5 rounded font-mono">⚡ CRITICAL</span>}
            {task.is_minimum && <span className="badge-pending text-xs px-2 py-0.5 rounded font-mono">MIN</span>}
            <span className="text-xs font-mono text-ash flex items-center gap-1">
              <Timer className="w-3 h-3" /> {task.focus_duration}min
            </span>
          </div>
        </div>

        {/* Timer display */}
        {activeTimer?.taskId === task.id && (
          <div className="shrink-0 text-center">
            <div className="font-mono text-2xl text-ember font-bold">{formatTime(activeTimer.remaining)}</div>
            <div className="flex gap-1 mt-1">
              <button onClick={() => setActiveTimer(prev => prev ? { ...prev, running: !prev.running } : null)} className="p-1 rounded bg-ember/20 text-ember hover:bg-ember/30">
                {activeTimer.running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
              <button onClick={() => setActiveTimer(null)} className="p-1 rounded bg-iron text-ash hover:text-silver">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {task.status === 'pending' && (
          <div className="flex flex-col gap-1.5 shrink-0">
            {activeTimer?.taskId !== task.id && (
              <button onClick={() => startTimer(task)} className="px-3 py-1.5 rounded bg-ember/15 text-ember text-xs font-mono border border-ember/25 hover:bg-ember/25 transition-colors flex items-center gap-1">
                <Play className="w-3 h-3" /> FOCUS
              </button>
            )}
            <button onClick={() => handleTaskStatus(task.id, 'done')} className="px-3 py-1.5 rounded bg-neon/15 text-neon text-xs font-mono border border-neon/25 hover:bg-neon/25 transition-colors">
              DONE ✓
            </button>
            <button onClick={() => handleTaskStatus(task.id, 'failed')} className="px-3 py-1.5 rounded bg-fire/10 text-fire text-xs font-mono border border-fire/20 hover:bg-fire/20 transition-colors">
              FAILED ✗
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="font-mono text-xs text-ash tracking-widest mb-2 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-ember" />
            MISSION SYSTEM
          </div>
          <h1 className="font-heading font-bold text-3xl text-snow">TODAY'S MISSION</h1>
          <p className="text-silver text-sm mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-ember px-5 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD TASK
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'TOTAL', val: tasks.length, color: 'text-silver' },
          { label: 'DONE', val: doneTasks, color: 'text-neon' },
          { label: 'FAILED', val: failedTasks, color: 'text-fire' },
          { label: 'MINIMUM', val: `${minimumDone}/${minimumTotal}`, color: minimumDone >= minimumTotal ? 'text-neon' : 'text-ember' },
        ].map(s => (
          <div key={s.label} className="card-void rounded-lg p-4 text-center">
            <div className={cn('font-display text-3xl', s.color)}>{s.val}</div>
            <div className="font-mono text-xs text-ash tracking-wider mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Minimum Warning */}
      {minimumTotal > 0 && minimumDone < minimumTotal && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-fire/10 border border-fire/30 mb-5">
          <AlertTriangle className="w-4 h-4 text-fire shrink-0" />
          <span className="text-sm text-fire font-heading font-semibold">
            {minimumTotal - minimumDone} minimum task(s) remaining. You cannot call this day a success without completing them.
          </span>
        </div>
      )}

      {/* Add Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="card-void rounded-xl p-6 border border-ember/20">
              <h3 className="font-heading font-bold text-snow mb-4">NEW TASK</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-ash tracking-widest mb-2">TASK NAME *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="What must be done?"
                    className="input-void w-full px-4 py-3 rounded text-sm"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-ash tracking-widest mb-2">DESCRIPTION (optional)</label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Any notes..."
                    className="input-void w-full px-4 py-3 rounded text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-ash tracking-widest mb-2">FOCUS TIME (minutes)</label>
                    <input
                      type="number"
                      value={form.focus_duration}
                      onChange={e => setForm({ ...form, focus_duration: parseInt(e.target.value) || 25 })}
                      min={5}
                      max={120}
                      className="input-void w-full px-4 py-3 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-ash tracking-widest mb-2">LINKED GOAL</label>
                    <select
                      value={form.goal_id}
                      onChange={e => setForm({ ...form, goal_id: e.target.value })}
                      className="input-void w-full px-4 py-3 rounded text-sm"
                    >
                      <option value="">None</option>
                      {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_critical}
                      onChange={e => setForm({ ...form, is_critical: e.target.checked })}
                      className="accent-fire w-4 h-4"
                    />
                    <span className="text-sm text-silver">CRITICAL TASK</span>
                    <span className="text-xs text-ash">(must do, no excuses)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_minimum}
                      onChange={e => setForm({ ...form, is_minimum: e.target.checked })}
                      className="accent-ember w-4 h-4"
                    />
                    <span className="text-sm text-silver">MINIMUM WORK</span>
                    <span className="text-xs text-ash">(daily baseline)</span>
                  </label>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddTask} disabled={loading} className="btn-ember px-6 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ADD TO MISSION'}
                  </button>
                  <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded text-ash hover:text-silver text-sm border border-white/10 hover:border-white/20 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks Sections */}
      {tasks.length === 0 ? (
        <div className="card-void rounded-xl p-16 text-center">
          <Zap className="w-12 h-12 text-ash mx-auto mb-4" />
          <h3 className="font-heading font-bold text-xl text-silver mb-2">No tasks for today</h3>
          <p className="text-ash text-sm mb-6">An empty mission is a failed day. Add your tasks now.</p>
          <button onClick={() => setShowForm(true)} className="btn-ember px-6 py-3 rounded font-heading font-bold text-sm">
            ADD FIRST TASK
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {criticalTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-4 h-4 text-fire" />
                <span className="font-mono text-xs text-fire tracking-widest">CRITICAL TASKS</span>
                <div className="flex-1 h-px bg-fire/20" />
              </div>
              <div className="space-y-2">{criticalTasks.map(renderTask)}</div>
            </div>
          )}
          {minimumTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-ember" />
                <span className="font-mono text-xs text-ember tracking-widest">MINIMUM TASKS</span>
                <div className="flex-1 h-px bg-ember/20" />
              </div>
              <div className="space-y-2">{minimumTasks.map(renderTask)}</div>
            </div>
          )}
          {regularTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-ash" />
                <span className="font-mono text-xs text-ash tracking-widest">OTHER TASKS</span>
                <div className="flex-1 h-px bg-white/8" />
              </div>
              <div className="space-y-2">{regularTasks.map(renderTask)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
