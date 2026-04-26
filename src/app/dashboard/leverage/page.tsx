'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { LeverageInsight, Goal } from '@/types';
import { BarChart2, Zap, TrendingUp, BookOpen, Target, RefreshCw, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['all', 'strategy', 'mindset', 'market', 'skill', 'action'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_CONFIG: Record<string, { color: string; icon: React.ComponentType<{ className?: string }> }> = {
  strategy: { color: 'text-electric', icon: Target },
  mindset: { color: 'text-violet', icon: Zap },
  market: { color: 'text-gold', icon: TrendingUp },
  skill: { color: 'text-neon', icon: BookOpen },
  action: { color: 'text-ember', icon: Zap },
};

export default function LeveragePage() {
  const [insights, setInsights] = useState<LeverageInsight[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState('');
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: insightsData }, { data: goalsData }] = await Promise.all([
      supabase.from('leverage_insights').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', user.id).eq('status', 'active'),
    ]);

    if (insightsData) setInsights(insightsData);
    if (goalsData) setGoals(goalsData);

    // Generate initial insights if none exist
    if (!insightsData || insightsData.length === 0) {
      if (goalsData && goalsData.length > 0) {
        generateInsights(user.id, goalsData[0]);
      }
    }
  };

  const generateInsights = async (uid: string, goal?: Goal) => {
    setGenerating(true);
    const targetGoal = goal || goals.find(g => g.id === selectedGoal) || goals[0];
    if (!targetGoal) { toast.error('Set a goal first to get leverage insights.'); setGenerating(false); return; }

    try {
      const response = await fetch('/api/leverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: targetGoal, userId: uid || userId }),
      });
      const data = await response.json();
      if (data.insights) {
        // Save to DB
        for (const insight of data.insights) {
          await supabase.from('leverage_insights').insert({
            user_id: uid || userId,
            goal_id: targetGoal.id,
            ...insight,
          });
        }
        toast.success('New leverage insights generated.');
        loadData();
      }
    } catch {
      toast.error('Failed to generate insights.');
    } finally {
      setGenerating(false);
    }
  };

  const markRead = async (insightId: string) => {
    await supabase.from('leverage_insights').update({ is_read: true }).eq('id', insightId);
    setInsights(prev => prev.map(i => i.id === insightId ? { ...i, is_read: true } : i));
  };

  const filtered = insights.filter(ins => {
    const goalMatch = selectedGoal === 'all' || ins.goal_id === selectedGoal;
    const catMatch = selectedCategory === 'all' || ins.category === selectedCategory;
    return goalMatch && catMatch;
  });

  const unreadCount = insights.filter(i => !i.is_read).length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-ash tracking-widest mb-2 flex items-center gap-2">
            <BarChart2 className="w-3.5 h-3.5 text-ember" />
            LEVERAGE PANEL
          </div>
          <h1 className="font-heading font-bold text-3xl text-snow">DAILY INTELLIGENCE</h1>
          <p className="text-silver text-sm mt-1">What you should know. What you should do. Move faster.</p>
        </div>
        <button
          onClick={() => generateInsights(userId)}
          disabled={generating}
          className="btn-ember px-5 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {generating ? 'GENERATING...' : 'NEW INSIGHTS'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-void rounded-xl p-4 text-center">
          <div className="font-display text-4xl text-ember">{insights.length}</div>
          <div className="font-mono text-xs text-ash tracking-wider mt-1">TOTAL INSIGHTS</div>
        </div>
        <div className="card-void rounded-xl p-4 text-center">
          <div className="font-display text-4xl text-gold">{unreadCount}</div>
          <div className="font-mono text-xs text-ash tracking-wider mt-1">UNREAD</div>
        </div>
        <div className="card-void rounded-xl p-4 text-center">
          <div className="font-display text-4xl text-neon">{insights.filter(i => i.is_read).length}</div>
          <div className="font-mono text-xs text-ash tracking-wider mt-1">REVIEWED</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-1 bg-iron/40 rounded-lg p-1">
          <button
            onClick={() => setSelectedGoal('all')}
            className={cn('px-4 py-1.5 rounded text-xs font-mono transition-all', selectedGoal === 'all' ? 'bg-ember text-void font-bold' : 'text-ash hover:text-silver')}
          >
            ALL GOALS
          </button>
          {goals.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGoal(g.id)}
              className={cn('px-4 py-1.5 rounded text-xs font-mono transition-all max-w-32 truncate', selectedGoal === g.id ? 'bg-ember text-void font-bold' : 'text-ash hover:text-silver')}
            >
              {g.title}
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-iron/40 rounded-lg p-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn('px-3 py-1.5 rounded text-xs font-mono capitalize transition-all', selectedCategory === cat ? 'bg-white/15 text-snow' : 'text-ash hover:text-silver')}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Insights */}
      {generating && insights.length === 0 ? (
        <div className="card-void rounded-xl p-16 text-center">
          <Loader2 className="w-10 h-10 text-ember mx-auto mb-4 animate-spin" />
          <p className="text-silver text-sm">Generating your personalized leverage insights...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-void rounded-xl p-16 text-center">
          <BarChart2 className="w-10 h-10 text-ash mx-auto mb-4" />
          <h3 className="font-heading font-bold text-xl text-silver mb-2">No insights yet</h3>
          <p className="text-ash text-sm mb-6">Set a goal and generate your daily intelligence briefing.</p>
          {goals.length === 0 ? (
            <a href="/dashboard/clarity-engine" className="btn-ember px-6 py-3 rounded font-heading font-bold text-sm inline-block">
              SET A GOAL FIRST
            </a>
          ) : (
            <button onClick={() => generateInsights(userId)} className="btn-ember px-6 py-3 rounded font-heading font-bold text-sm">
              GENERATE INSIGHTS
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((insight, i) => {
            const config = CATEGORY_CONFIG[insight.category] || CATEGORY_CONFIG.action;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'card-void rounded-xl p-5 card-hover transition-all',
                  !insight.is_read && 'border-ember/20'
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white/5')}>
                    <config.icon className={cn('w-5 h-5', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={cn('text-xs font-mono tracking-wider uppercase', config.color)}>
                        {insight.category}
                      </span>
                      {!insight.is_read && (
                        <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-snow mb-2">{insight.title}</h3>
                    <p className="text-silver text-sm leading-relaxed mb-3">{insight.content}</p>

                    {insight.action_item && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-ember/8 border border-ember/20">
                        <Zap className="w-3.5 h-3.5 text-ember mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-mono text-ember mb-0.5">ACTION NOW</div>
                          <div className="text-sm text-silver">{insight.action_item}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      {insight.source && (
                        <span className="text-xs font-mono text-ash flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {insight.source}
                        </span>
                      )}
                      {!insight.is_read && (
                        <button
                          onClick={() => markRead(insight.id)}
                          className="text-xs font-mono text-neon hover:text-neon/70 flex items-center gap-1 ml-auto transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          MARK READ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
