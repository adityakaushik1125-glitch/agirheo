'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Goal } from '@/types';
import { Target, Plus, Trash2, Edit3, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2, Calendar } from 'lucide-react';
import { cn, getDaysUntilDeadline } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const GOAL_QUESTIONS = [
  { field: 'title', label: 'YOUR GOAL', placeholder: 'What exactly do you want to achieve?', type: 'text', hint: 'Be specific. "Get fit" is not a goal. "Run 5km in under 25 minutes" is a goal.' },
  { field: 'why', label: 'WHY — THE EMOTIONAL REASON', placeholder: 'Why do you really want this? What pain are you escaping? What dream are you chasing?', type: 'textarea', hint: 'This is your fuel. When it gets hard, this is why you keep going.' },
  { field: 'outcome', label: 'MEASURABLE OUTCOME', placeholder: 'How will you know you succeeded? Numbers, milestones, proof.', type: 'text', hint: 'Vague outcomes = vague results. Define exactly what success looks like.' },
  { field: 'deadline', label: 'DEADLINE', placeholder: '', type: 'date', hint: 'Without a deadline, a goal is just a wish.' },
  { field: 'sacrifice', label: 'WHAT YOU WILL GIVE UP', placeholder: 'What comfort, habit, or pleasure will you sacrifice to get this?', type: 'textarea', hint: 'Every win requires a trade. Name your trade.' },
  { field: 'identity_statement', label: 'IDENTITY STATEMENT', placeholder: 'I am the kind of person who...', type: 'text', hint: 'You don\'t rise to your goals. You fall to your identity. Define who you are becoming.' },
];

interface GoalForm {
  title: string;
  why: string;
  outcome: string;
  deadline: string;
  sacrifice: string;
  identity_statement: string;
  category: string;
}

const defaultForm: GoalForm = {
  title: '', why: '', outcome: '', deadline: '', sacrifice: '', identity_statement: '', category: 'general'
};

export default function ClarityEnginePage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<GoalForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) setGoals(data);
  };

  const currentQ = GOAL_QUESTIONS[step];
  const isLastStep = step === GOAL_QUESTIONS.length - 1;
  const progress = ((step) / GOAL_QUESTIONS.length) * 100;

  const handleNext = () => {
    const val = form[currentQ.field as keyof GoalForm];
    if (!val.trim()) { toast.error('This field is required. Be honest.'); return; }
    if (isLastStep) { handleSubmit(); } else { setStep(step + 1); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('goals').insert({
        ...form,
        user_id: userId,
        status: 'active',
        progress: 0,
      });
      if (error) throw error;

      // Create default streak for goal
      const { data: newGoal } = await supabase.from('goals').select('id').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single();
      if (newGoal) {
        await supabase.from('streaks').insert({ user_id: userId, goal_id: newGoal.id });
      }

      toast.success('Goal set. Now execute.');
      setShowForm(false);
      setForm(defaultForm);
      setStep(0);
      loadGoals();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save goal');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Delete this goal? This cannot be undone.')) return;
    await supabase.from('goals').delete().eq('id', goalId);
    toast.success('Goal removed.');
    loadGoals();
  };

  const handleStatusChange = async (goalId: string, status: Goal['status']) => {
    await supabase.from('goals').update({ status }).eq('id', goalId);
    toast.success(`Goal marked as ${status}`);
    loadGoals();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="font-mono text-xs text-ash tracking-widest mb-2 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-ember" />
            CLARITY ENGINE
          </div>
          <h1 className="font-heading font-bold text-3xl text-snow">YOUR GOALS</h1>
          <p className="text-silver text-sm mt-1">Purpose, commitment, and identity — defined with precision.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setStep(0); setForm(defaultForm); }}
          className="btn-ember px-5 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          NEW GOAL
        </button>
      </div>

      {/* Goal Creation Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-void rounded-xl p-8 mb-8 border border-ember/20"
          >
            {/* Progress */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-1.5 bg-iron rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${((step + 1) / GOAL_QUESTIONS.length) * 100}%` }}
                  className="h-full bg-ember rounded-full"
                />
              </div>
              <span className="text-xs font-mono text-ash whitespace-nowrap">{step + 1}/{GOAL_QUESTIONS.length}</span>
            </div>

            <div className="mb-6">
              <div className="font-mono text-xs text-ember tracking-widest mb-2">{currentQ.label}</div>
              <p className="text-ash text-xs mb-5 leading-relaxed border-l-2 border-ember/30 pl-3">{currentQ.hint}</p>

              {currentQ.type === 'textarea' ? (
                <textarea
                  value={form[currentQ.field as keyof GoalForm]}
                  onChange={e => setForm({ ...form, [currentQ.field]: e.target.value })}
                  placeholder={currentQ.placeholder}
                  rows={4}
                  className="input-void w-full px-4 py-3 rounded text-sm resize-none"
                  autoFocus
                />
              ) : currentQ.type === 'date' ? (
                <input
                  type="date"
                  value={form[currentQ.field as keyof GoalForm]}
                  onChange={e => setForm({ ...form, [currentQ.field]: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-void w-full px-4 py-3 rounded text-sm"
                  autoFocus
                />
              ) : (
                <input
                  type="text"
                  value={form[currentQ.field as keyof GoalForm]}
                  onChange={e => setForm({ ...form, [currentQ.field]: e.target.value })}
                  placeholder={currentQ.placeholder}
                  className="input-void w-full px-4 py-3 rounded text-sm"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                />
              )}
            </div>

            <div className="flex items-center gap-3">
              {step > 0 && (
                <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded border border-white/10 text-silver text-sm hover:border-white/20 transition-colors font-heading font-medium">
                  ← BACK
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={loading}
                className="btn-ember px-6 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isLastStep ? 'COMMIT TO THIS GOAL →' : 'NEXT →'}
              </button>
              <button onClick={() => setShowForm(false)} className="ml-auto text-xs text-ash hover:text-silver transition-colors">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {goals.length === 0 && !showForm ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-void rounded-xl p-16 text-center"
        >
          <Target className="w-12 h-12 text-ash mx-auto mb-4" />
          <h3 className="font-heading font-bold text-xl text-silver mb-2">No goals yet</h3>
          <p className="text-ash text-sm mb-6">A man without a goal is lost before he starts.</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-ember px-6 py-3 rounded font-heading font-bold text-sm"
          >
            SET YOUR FIRST GOAL
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, i) => {
            const daysLeft = getDaysUntilDeadline(goal.deadline);
            const isExpanded = expandedGoal === goal.id;
            const isUrgent = daysLeft <= 7 && daysLeft > 0;
            const isOverdue = daysLeft <= 0;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn('card-void rounded-xl overflow-hidden', {
                  'border-fire/30': isOverdue,
                  'border-gold/20': isUrgent && !isOverdue,
                  'opacity-60': goal.status === 'completed' || goal.status === 'failed',
                })}
              >
                {/* Goal Header */}
                <div className="p-5 flex items-start gap-4">
                  <div className={cn('w-3 h-3 rounded-full mt-1.5 shrink-0', {
                    'bg-neon': goal.status === 'completed',
                    'bg-fire': goal.status === 'failed' || isOverdue,
                    'bg-gold': isUrgent && !isOverdue && goal.status === 'active',
                    'bg-ember': goal.status === 'active' && !isUrgent && !isOverdue,
                    'bg-ash': goal.status === 'paused',
                  })} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="font-heading font-bold text-lg text-snow">{goal.title}</h3>
                      <span className={cn('text-xs font-mono px-2 py-0.5 rounded', {
                        'badge-done': goal.status === 'completed',
                        'badge-failed': goal.status === 'failed',
                        'badge-pending': goal.status === 'active',
                        'bg-ash/20 text-ash border border-ash/20': goal.status === 'paused',
                      })}>
                        {goal.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-silver italic mb-3">"{goal.identity_statement}"</div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-1.5 bg-iron rounded-full overflow-hidden">
                        <div className="h-full bg-ember rounded-full" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <span className="text-xs font-mono text-ash">{goal.progress}%</span>
                    </div>

                    <div className={cn('text-xs font-mono flex items-center gap-1', {
                      'text-fire': isOverdue,
                      'text-gold': isUrgent && !isOverdue,
                      'text-ash': !isUrgent && !isOverdue,
                    })}>
                      <Calendar className="w-3 h-3" />
                      {isOverdue ? 'OVERDUE' : `${daysLeft} days left`} — {format(new Date(goal.deadline), 'MMM d, yyyy')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                      className="p-2 rounded hover:bg-white/5 text-ash hover:text-silver transition-all"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {goal.status === 'active' && (
                      <button
                        onClick={() => handleStatusChange(goal.id, 'completed')}
                        className="p-2 rounded hover:bg-neon/10 text-ash hover:text-neon transition-all"
                        title="Mark Complete"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 rounded hover:bg-fire/10 text-ash hover:text-fire transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-0 border-t border-white/5 mt-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {[
                            { label: '🔥 WHY', value: goal.why },
                            { label: '🎯 OUTCOME', value: goal.outcome },
                            { label: '💀 SACRIFICE', value: goal.sacrifice },
                            { label: '⚡ IDENTITY', value: goal.identity_statement },
                          ].map(item => (
                            <div key={item.label} className="bg-iron/30 rounded-lg p-4">
                              <div className="font-mono text-xs text-ember tracking-wider mb-2">{item.label}</div>
                              <p className="text-sm text-silver leading-relaxed">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
