'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import {
  Target, Zap, TrendingUp, ArrowRight, CheckCircle2,
  XCircle, Clock, Flame, Trophy, AlertTriangle
} from 'lucide-react';
import type { Profile, Goal, Task, Streak, DailyLog } from '@/types';
import { cn, getDaysUntilDeadline, getMotivationalMessage } from '@/lib/utils';

interface Props {
  profile: Profile | null;
  goals: Goal[];
  todayTasks: Task[];
  streak: Streak | null;
  recentLog: DailyLog | null;
  stats: { tasksDone: number; tasksFailed: number; tasksTotal: number; minimumDone: number; minimumTotal: number };
  userId: string;
}

export default function DashboardClient({ profile, goals, todayTasks, streak, stats }: Props) {
  const taskCompletionRate = stats.tasksTotal > 0 ? Math.round((stats.tasksDone / stats.tasksTotal) * 100) : 0;
  const minimumComplete = stats.minimumTotal === 0 || stats.minimumDone >= stats.minimumTotal;

  const cards = [
    {
      icon: Flame,
      label: 'CURRENT STREAK',
      value: streak?.current_streak || 0,
      unit: 'days',
      color: 'ember',
      href: '/dashboard/tracker',
    },
    {
      icon: Trophy,
      label: 'BEST STREAK',
      value: streak?.best_streak || 0,
      unit: 'days',
      color: 'gold',
      href: '/dashboard/tracker',
    },
    {
      icon: Zap,
      label: "TODAY'S TASKS",
      value: `${stats.tasksDone}/${stats.tasksTotal}`,
      unit: 'done',
      color: 'neon',
      href: '/dashboard/mission-system',
    },
    {
      icon: Target,
      label: 'ACTIVE GOALS',
      value: goals.length,
      unit: 'goals',
      color: 'electric',
      href: '/dashboard/clarity-engine',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div>
          <div className="font-mono text-xs text-ash tracking-widest mb-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy').toUpperCase()}
          </div>
          <h1 className="font-heading font-bold text-3xl text-snow">
            {getGreeting()}, <span className="text-ember">{profile?.full_name?.split(' ')[0] || 'Warrior'}</span>
          </h1>
          <p className="text-silver text-sm mt-1">{getMotivationalMessage(streak?.current_streak || 0)}</p>
        </div>
        <div className="text-right">
          <div className="font-display text-4xl text-ember">{profile?.xp || 0}</div>
          <div className="font-mono text-xs text-ash tracking-widest">XP TOTAL</div>
        </div>
      </motion.div>

      {/* Minimum Work Alert */}
      {!minimumComplete && stats.minimumTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 px-5 py-4 rounded-lg bg-fire/10 border border-fire/30"
        >
          <AlertTriangle className="w-5 h-5 text-fire shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-heading font-bold text-fire">MINIMUM WORK NOT COMPLETE</div>
            <div className="text-xs text-silver mt-0.5">
              You need to complete {stats.minimumTotal - stats.minimumDone} more minimum task(s) today. Don't break the chain.
            </div>
          </div>
          <Link href="/dashboard/mission-system" className="btn-ember px-4 py-2 rounded text-xs font-heading font-bold whitespace-nowrap">
            GO NOW →
          </Link>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={card.href} className="block card-void card-hover rounded-xl p-5 h-full">
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', {
                'bg-ember/10': card.color === 'ember',
                'bg-gold/10': card.color === 'gold',
                'bg-neon/10': card.color === 'neon',
                'bg-electric/10': card.color === 'electric',
              })}>
                <card.icon className={cn('w-5 h-5', {
                  'text-ember': card.color === 'ember',
                  'text-gold': card.color === 'gold',
                  'text-neon': card.color === 'neon',
                  'text-electric': card.color === 'electric',
                })} />
              </div>
              <div className={cn('font-display text-4xl mb-1', {
                'text-ember': card.color === 'ember',
                'text-gold': card.color === 'gold',
                'text-neon': card.color === 'neon',
                'text-electric': card.color === 'electric',
              })}>
                {card.value}
              </div>
              <div className="font-mono text-xs text-ash tracking-widest">{card.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Mission Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 card-void rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="font-mono text-xs text-ash tracking-widest mb-1">TODAY'S MISSION</div>
              <h2 className="font-heading font-bold text-lg text-snow">
                {taskCompletionRate}% Complete
              </h2>
            </div>
            <Link href="/dashboard/mission-system" className="flex items-center gap-1.5 text-xs text-ember hover:text-fire transition-colors font-mono">
              VIEW ALL <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-iron rounded-full overflow-hidden mb-5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${taskCompletionRate}%` }}
              transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
              className="h-full xp-bar-fill rounded-full"
            />
          </div>

          {/* Task list preview */}
          {todayTasks.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-ash text-sm mb-3">No tasks for today yet.</div>
              <Link href="/dashboard/mission-system" className="btn-ember px-4 py-2 rounded text-xs font-heading font-bold">
                ADD TASKS →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTasks.slice(0, 5).map((task) => (
                <div key={task.id} className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg',
                  task.status === 'done' ? 'bg-neon/5 border border-neon/10' :
                  task.status === 'failed' ? 'bg-fire/5 border border-fire/10' :
                  'bg-iron/50 border border-white/5'
                )}>
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-4 h-4 text-neon shrink-0" />
                  ) : task.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-fire shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-ash shrink-0" />
                  )}
                  <span className={cn('text-sm flex-1 truncate', {
                    'text-neon/70 line-through': task.status === 'done',
                    'text-fire/70': task.status === 'failed',
                    'text-silver': task.status === 'pending',
                  })}>
                    {task.title}
                  </span>
                  {task.is_critical && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-fire/15 text-fire border border-fire/20">CRITICAL</span>
                  )}
                  {task.is_minimum && (
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-ember/15 text-ember border border-ember/20">MIN</span>
                  )}
                </div>
              ))}
              {todayTasks.length > 5 && (
                <Link href="/dashboard/mission-system" className="block text-center text-xs text-ash hover:text-silver py-2 transition-colors">
                  +{todayTasks.length - 5} more tasks
                </Link>
              )}
            </div>
          )}
        </motion.div>

        {/* Active Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-void rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="font-mono text-xs text-ash tracking-widest">ACTIVE GOALS</div>
            <Link href="/dashboard/clarity-engine" className="text-xs text-ember hover:text-fire transition-colors font-mono flex items-center gap-1">
              ALL <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-ash text-sm mb-3">No active goals.</div>
              <Link href="/dashboard/clarity-engine" className="btn-ember px-4 py-2 rounded text-xs font-heading font-bold">
                SET A GOAL →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 4).map((goal) => {
                const daysLeft = getDaysUntilDeadline(goal.deadline);
                const isUrgent = daysLeft <= 7;
                return (
                  <Link key={goal.id} href="/dashboard/clarity-engine" className="block group">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', isUrgent ? 'bg-fire' : 'bg-ember')} />
                      <div className="min-w-0">
                        <div className="text-sm font-heading font-semibold text-snow group-hover:text-ember transition-colors truncate">
                          {goal.title}
                        </div>
                        <div className={cn('text-xs font-mono mt-0.5', isUrgent ? 'text-fire' : 'text-ash')}>
                          {daysLeft <= 0 ? 'OVERDUE' : `${daysLeft}d LEFT`}
                        </div>
                        <div className="mt-2 h-1 bg-iron rounded-full overflow-hidden">
                          <div
                            className="h-full bg-ember rounded-full transition-all"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          { href: '/dashboard/clarity-engine', label: 'NEW GOAL', icon: Target },
          { href: '/dashboard/mission-system', label: 'ADD TASK', icon: Zap },
          { href: '/dashboard/tracker', label: 'STREAK', icon: Flame },
          { href: '/dashboard/feedback', label: 'REFLECT', icon: TrendingUp },
          { href: '/dashboard/environment', label: 'COMMUNITY', icon: TrendingUp },
          { href: '/dashboard/leverage', label: 'LEVERAGE', icon: TrendingUp },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/8 bg-white/2 hover:border-ember/30 hover:bg-ember/5 transition-all group"
          >
            <action.icon className="w-3.5 h-3.5 text-ash group-hover:text-ember transition-colors" />
            <span className="text-xs font-mono text-ash group-hover:text-ember transition-colors tracking-wider">{action.label}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
