'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Focus, X } from 'lucide-react';
import type { Profile } from '@/types';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

export default function TopBar({ user, profile }: { user: User; profile: Profile | null }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [focusMode, setFocusMode] = useState(profile?.focus_mode || false);
  const supabase = createClient();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  };

  const toggleFocusMode = async () => {
    const newMode = !focusMode;
    setFocusMode(newMode);
    await supabase.from('profiles').update({ focus_mode: newMode }).eq('id', user.id);
  };

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
    setNotifications([]);
    setShowNotifs(false);
  };

  const unreadCount = notifications.length;

  return (
    <>
      {/* Focus Mode Banner */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="warning-banner px-6 py-2 flex items-center justify-center gap-3"
          >
            <Focus className="w-4 h-4 text-fire" />
            <span className="font-mono text-xs tracking-widest text-fire font-bold">
              FOCUS MODE ACTIVE — NO DISTRACTIONS. EXECUTE.
            </span>
            <Focus className="w-4 h-4 text-fire" />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-14 border-b border-white/5 bg-obsidian/50 backdrop-blur-xl flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-ash">
            {format(new Date(), 'EEEE, MMM d').toUpperCase()}
          </div>
          {(profile?.total_tasks_completed || 0) > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-ember/10 border border-ember/20">
              <Flame className="w-3 h-3 text-ember" />
              <span className="text-xs font-mono text-ember">{profile?.xp || 0} XP</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Focus Mode Toggle */}
          <button
            onClick={toggleFocusMode}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all',
              focusMode
                ? 'bg-fire/20 border border-fire/40 text-fire'
                : 'bg-white/3 border border-white/10 text-ash hover:text-silver'
            )}
          >
            <Focus className="w-3 h-3" />
            {focusMode ? 'FOCUS ON' : 'FOCUS MODE'}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded hover:bg-white/5 transition-colors"
            >
              <Bell className="w-5 h-5 text-ash" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-fire text-white text-xs flex items-center justify-center font-mono">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifs && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-80 card-void rounded-xl border border-white/10 overflow-hidden z-50"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="text-xs font-mono text-silver tracking-wider">NOTIFICATIONS</span>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-ember hover:text-fire transition-colors">
                          Mark all read
                        </button>
                      )}
                      <button onClick={() => setShowNotifs(false)}>
                        <X className="w-4 h-4 text-ash hover:text-silver" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-ash text-sm">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="px-4 py-3 border-b border-white/3 hover:bg-white/3 transition-colors">
                          <div className={cn('text-xs font-mono font-bold mb-1', {
                            'text-fire': n.type === 'danger',
                            'text-ember': n.type === 'warning' || n.type === 'mission',
                            'text-neon': n.type === 'success',
                            'text-electric': n.type === 'info',
                          })}>
                            {n.title}
                          </div>
                          <div className="text-xs text-ash">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}
