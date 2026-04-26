'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { DailyLog, Task, Goal } from '@/types';
import { MessageSquare, TrendingUp, AlertCircle, Loader2, ChevronDown, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FeedbackPage() {
  const [todayLog, setTodayLog] = useState<Partial<DailyLog>>({
    what_avoided: '', discipline_breaks: '', fix_tomorrow: '', mood: 7, productivity_score: 7,
  });
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');
  const [existingLog, setExistingLog] = useState<DailyLog | null>(null);
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: logsData }, { data: tasksData }, { data: goalsData }, { data: existing }] = await Promise.all([
      supabase.from('daily_logs').select('*').eq('user_id', user.id).order('log_date', { ascending: false }).limit(30),
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('scheduled_date', today),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
      supabase.from('daily_logs').select('*').eq('user_id', user.id).eq('log_date', today).single(),
    ]);

    if (logsData) setLogs(logsData);
    if (tasksData) setTodayTasks(tasksData);
    if (goalsData) setGoals(goalsData);
    if (existing) {
      setExistingLog(existing);
      setTodayLog(existing);
      if (existing.ai_feedback) setAiFeedback(existing.ai_feedback);
    }
  };

  const generateAIFeedback = async () => {
    setAiLoading(true);
    const tasksDone = todayTasks.filter(t => t.status === 'done').length;
    const tasksFailed = todayTasks.filter(t => t.status === 'failed').length;
    const tasksTotal = todayTasks.length;

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasksDone, tasksFailed, tasksTotal,
          whatAvoided: todayLog.what_avoided,
          disciplineBreaks: todayLog.discipline_breaks,
          fixTomorrow: todayLog.fix_tomorrow,
          mood: todayLog.mood,
          productivity: todayLog.productivity_score,
          goals: goals.map(g => ({ title: g.title, deadline: g.deadline, progress: g.progress })),
        }),
      });
      const data = await response.json();
      setAiFeedback(data.feedback);
    } catch {
      // Fallback feedback
      const rate = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;
      setAiFeedback(generateLocalFeedback(rate, tasksDone, tasksFailed, todayLog));
    } finally {
      setAiLoading(false);
    }
  };

  const generateLocalFeedback = (
    rate: number, done: number, failed: number,
    log: Partial<DailyLog>
  ): string => {
    let feedback = '';
    if (rate >= 80) feedback = `Strong execution today. ${done} tasks completed. You're building the habits of someone who succeeds. `;
    else if (rate >= 50) feedback = `Average day. ${done} done, ${failed} failed. You have more in you. The gap between your current self and your goal self is filled with days exactly like today — push harder. `;
    else feedback = `Below standard today. ${failed} tasks failed. This is the reality check: your future self is watching every day you choose comfort over commitment. `;

    if (log.what_avoided) feedback += `You admitted to avoiding: "${log.what_avoided}". Naming it is step one. Fixing it is the only step that matters. `;
    if (log.discipline_breaks) feedback += `Discipline breaks noted. These small surrenders compound. `;
    if (log.fix_tomorrow) feedback += `Tomorrow's focus: "${log.fix_tomorrow}". Hold yourself to it. `;

    feedback += rate >= 70
      ? 'Keep the momentum. You are becoming someone different.'
      : 'Tomorrow is a new mission. Wake up and execute without negotiation.';

    return feedback;
  };

  const saveLog = async () => {
    setSaving(true);
    const tasksDone = todayTasks.filter(t => t.status === 'done').length;
    const tasksFailed = todayTasks.filter(t => t.status === 'failed').length;

    try {
      const logData = {
        ...todayLog,
        user_id: userId,
        log_date: today,
        tasks_completed: tasksDone,
        tasks_failed: tasksFailed,
        ai_feedback: aiFeedback || null,
      };

      if (existingLog) {
        await supabase.from('daily_logs').update(logData).eq('id', existingLog.id);
      } else {
        await supabase.from('daily_logs').insert(logData);
      }

      toast.success('Reflection saved.');
      loadData();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const chartData = [...logs].reverse().slice(-14).map(l => ({
    date: format(new Date(l.log_date), 'MMM d'),
    done: l.tasks_completed,
    failed: l.tasks_failed,
    mood: l.mood || 0,
    productivity: l.productivity_score || 0,
  }));

  const tasksDone = todayTasks.filter(t => t.status === 'done').length;
  const tasksTotal = todayTasks.length;
  const rate = tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="font-mono text-xs text-ash tracking-widest mb-2 flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-ember" />
          FEEDBACK SYSTEM
        </div>
        <h1 className="font-heading font-bold text-3xl text-snow">DAILY REFLECTION</h1>
        <p className="text-silver text-sm mt-1">Honest. Brutal. Necessary.</p>
      </div>

      {/* Today's stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-void rounded-xl p-5 text-center">
          <div className="font-display text-4xl text-neon">{tasksDone}</div>
          <div className="font-mono text-xs text-ash tracking-wider mt-1">TASKS DONE</div>
        </div>
        <div className="card-void rounded-xl p-5 text-center">
          <div className="font-display text-4xl text-fire">{todayTasks.filter(t => t.status === 'failed').length}</div>
          <div className="font-mono text-xs text-ash tracking-wider mt-1">FAILED</div>
        </div>
        <div className="card-void rounded-xl p-5 text-center">
          <div className={cn('font-display text-4xl', rate >= 70 ? 'text-neon' : rate >= 40 ? 'text-ember' : 'text-fire')}>
            {rate}%
          </div>
          <div className="font-mono text-xs text-ash tracking-wider mt-1">COMPLETION</div>
        </div>
      </div>

      {/* Reflection Form */}
      <div className="card-void rounded-xl p-6 mb-6">
        <div className="font-mono text-xs text-ember tracking-widest mb-5">TODAY'S REFLECTION</div>

        <div className="space-y-5">
          {[
            { key: 'what_avoided', label: 'WHAT DID YOU AVOID TODAY?', placeholder: 'Be brutally honest. What task or responsibility did you dodge?', hint: 'Avoidance is the silent killer of potential.' },
            { key: 'discipline_breaks', label: 'WHERE DID YOU BREAK DISCIPLINE?', placeholder: 'What habit, commitment, or standard did you violate?', hint: 'Awareness without action is worthless. But awareness is first.' },
            { key: 'fix_tomorrow', label: 'WHAT WILL YOU FIX TOMORROW?', placeholder: 'One specific thing you will do differently.', hint: 'Don\'t write a list. Name one thing and commit to it.' },
          ].map(({ key, label, placeholder, hint }) => (
            <div key={key}>
              <label className="block font-mono text-xs text-ember tracking-wider mb-1">{label}</label>
              <p className="text-xs text-ash mb-2 italic">{hint}</p>
              <textarea
                value={(todayLog as Record<string, string | number | null>)[key] as string || ''}
                onChange={e => setTodayLog({ ...todayLog, [key]: e.target.value })}
                placeholder={placeholder}
                rows={3}
                className="input-void w-full px-4 py-3 rounded text-sm resize-none"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'mood', label: 'MOOD', min: 1, max: 10 },
              { key: 'productivity_score', label: 'PRODUCTIVITY', min: 1, max: 10 },
            ].map(({ key, label, min, max }) => (
              <div key={key}>
                <label className="block font-mono text-xs text-ash tracking-wider mb-2">
                  {label}: <span className="text-ember">{(todayLog as Record<string, string | number | null>)[key] || 7}/10</span>
                </label>
                <input
                  type="range"
                  min={min}
                  max={max}
                  value={(todayLog as Record<string, string | number | null>)[key] as number || 7}
                  onChange={e => setTodayLog({ ...todayLog, [key]: parseInt(e.target.value) })}
                  className="w-full accent-ember"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <button
            onClick={generateAIFeedback}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded bg-violet/20 border border-violet/30 text-violet text-sm font-heading font-bold hover:bg-violet/30 transition-colors"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4" />}
            GET AI FEEDBACK
          </button>
          <button onClick={saveLog} disabled={saving} className="btn-ember px-5 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'SAVE REFLECTION'}
          </button>
        </div>
      </div>

      {/* AI Feedback */}
      {aiFeedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-void rounded-xl p-6 mb-6 border border-violet/25"
        >
          <div className="font-mono text-xs text-violet tracking-widest mb-3 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5" />
            AI REALITY CHECK
          </div>
          <p className="text-silver text-sm leading-relaxed">{aiFeedback}</p>
        </motion.div>
      )}

      {/* 14-day Chart */}
      {chartData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-void rounded-xl p-6"
        >
          <div className="font-mono text-xs text-ash tracking-widest mb-5 flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5" />
            14-DAY PERFORMANCE
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fill: '#6b6b8a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111118', border: '1px solid rgba(255,107,0,0.3)', borderRadius: '8px', color: '#e8e8f0', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="done" stroke="#00ff88" strokeWidth={2} dot={false} name="Done" />
              <Line type="monotone" dataKey="failed" stroke="#ff4444" strokeWidth={2} dot={false} name="Failed" />
              <Line type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="Mood" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
