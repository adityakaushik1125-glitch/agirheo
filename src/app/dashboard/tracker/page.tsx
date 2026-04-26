'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Streak, Goal, StreakDay } from '@/types';
import { Flame, Trophy, X, TrendingUp, Calendar } from 'lucide-react';
import { cn, getMotivationalMessage } from '@/lib/utils';
import { format, subDays, isSameDay, parseISO } from 'date-fns';

export default function TrackerPage() {
  const [streaks, setStreaks] = useState<(Streak & { goal?: Goal })[]>([]);
  const [mainStreak, setMainStreak] = useState<Streak | null>(null);
  const [userId, setUserId] = useState('');
  const supabase = createClient();

  useEffect(() => { loadStreaks(); }, []);

  const loadStreaks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: streakData }, { data: goals }] = await Promise.all([
      supabase.from('streaks').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
    ]);

    if (streakData) {
      const enriched = streakData.map(s => ({
        ...s,
        goal: goals?.find(g => g.id === s.goal_id),
      }));
      setStreaks(enriched);
      const main = enriched.find(s => !s.goal_id);
      if (main) setMainStreak(main);
    }
  };

  // Generate last 90 days for heatmap
  const generateHeatmapDays = (streakData: StreakDay[] = []) => {
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const entry = streakData.find(d => d.date === dateStr);
      const isToday = i === 0;
      days.push({ date, dateStr, entry, isToday });
    }
    return days;
  };

  const heatmapDays = generateHeatmapDays((mainStreak?.streak_data as StreakDay[]) || []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-ash tracking-widest mb-2 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-ember" />
          STREAK TRACKER
        </div>
        <h1 className="font-heading font-bold text-3xl text-snow">CONSISTENCY IS POWER</h1>
        <p className="text-silver text-sm mt-1">{getMotivationalMessage(mainStreak?.current_streak || 0)}</p>
      </div>

      {/* Main Streak Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-void rounded-2xl p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-ember/5 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="font-mono text-xs text-ash tracking-widest">OVERALL STREAK</div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" />
              <span className="text-xs font-mono text-gold">BEST: {mainStreak?.best_streak || 0} DAYS</span>
            </div>
          </div>

          <div className="flex items-end gap-6 mb-6">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="font-display text-8xl text-ember ember-glow-text leading-none"
              >
                {mainStreak?.current_streak || 0}
              </motion.div>
              <div className="font-mono text-xs text-ash tracking-widest mt-2">CURRENT STREAK</div>
            </div>
            <div className="flex-1 pb-3">
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-ember" />
                  <div>
                    <div className="font-display text-3xl text-snow">{mainStreak?.current_streak || 0}</div>
                    <div className="text-xs font-mono text-ash">DAYS ACTIVE</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-fire" />
                  <div>
                    <div className="font-display text-3xl text-snow">{mainStreak?.failure_count || 0}</div>
                    <div className="text-xs font-mono text-ash">FAILURES</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" />
                  <div>
                    <div className="font-display text-3xl text-snow">{mainStreak?.best_streak || 0}</div>
                    <div className="text-xs font-mono text-ash">BEST STREAK</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Don't break the chain message */}
          {(mainStreak?.current_streak || 0) > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-ember/10 border border-ember/25">
              <Flame className="w-4 h-4 text-ember" />
              <span className="text-sm text-ember font-heading font-semibold">
                DON'T BREAK THE CHAIN. You've come too far.
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Heat Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-void rounded-xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="font-mono text-xs text-ash tracking-widest flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            LAST 90 DAYS
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm streak-active" />
              <span className="text-ash">ACTIVE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm streak-missed" />
              <span className="text-ash">MISSED</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm streak-today" />
              <span className="text-ash">TODAY</span>
            </div>
          </div>
        </div>

        <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(18, 1fr)' }}>
          {heatmapDays.map((day) => (
            <div
              key={day.dateStr}
              title={`${day.dateStr}${day.entry ? ` — ${day.entry.tasks_done} tasks` : ''}`}
              className={cn(
                'aspect-square rounded-sm cursor-pointer streak-cell',
                day.isToday ? 'streak-today' :
                day.entry?.completed ? 'streak-active' :
                day.entry ? 'streak-missed' :
                'streak-empty'
              )}
            />
          ))}
        </div>

        <div className="flex justify-between mt-3 text-xs font-mono text-ash">
          <span>{format(subDays(new Date(), 89), 'MMM d')}</span>
          <span>TODAY</span>
        </div>
      </motion.div>

      {/* Per-Goal Streaks */}
      {streaks.filter(s => s.goal_id).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-void rounded-xl p-6"
        >
          <div className="font-mono text-xs text-ash tracking-widest mb-5">GOAL STREAKS</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {streaks.filter(s => s.goal_id && s.goal).map((streak, i) => (
              <motion.div
                key={streak.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-iron/30 rounded-xl p-5 border border-white/5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-heading font-semibold text-snow text-sm truncate">{streak.goal?.title}</div>
                    <div className="text-xs text-ash mt-0.5 font-mono">{streak.goal?.category?.toUpperCase()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-3xl text-ember">{streak.current_streak}</div>
                    <div className="text-xs font-mono text-ash">DAYS</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <div className="text-center">
                    <div className="text-gold font-bold">{streak.best_streak}</div>
                    <div className="text-ash mt-0.5">BEST</div>
                  </div>
                  <div className="text-center">
                    <div className="text-fire font-bold">{streak.failure_count}</div>
                    <div className="text-ash mt-0.5">FAILURES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-neon font-bold">
                      {streak.streak_data ? (streak.streak_data as StreakDay[]).filter(d => d.completed).length : 0}
                    </div>
                    <div className="text-ash mt-0.5">TOTAL ACTIVE</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
