'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import {
  LayoutDashboard, Target, Zap, TrendingUp, MessageSquare,
  Shield, BarChart2, Settings, LogOut, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'DASHBOARD', key: 'dashboard' },
  { href: '/dashboard/clarity-engine', icon: Target, label: 'CLARITY ENGINE', key: 'clarity' },
  { href: '/dashboard/mission-system', icon: Zap, label: 'MISSION SYSTEM', key: 'mission' },
  { href: '/dashboard/tracker', icon: TrendingUp, label: 'STREAK TRACKER', key: 'tracker' },
  { href: '/dashboard/feedback', icon: MessageSquare, label: 'FEEDBACK', key: 'feedback' },
  { href: '/dashboard/environment', icon: Shield, label: 'ENVIRONMENT', key: 'environment' },
  { href: '/dashboard/leverage', icon: BarChart2, label: 'LEVERAGE PANEL', key: 'leverage' },
];

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Mission paused. See you tomorrow.');
    router.push('/');
    router.refresh();
  };

  const xpToNext = ((profile?.xp || 0) % 1000);
  const xpPercent = (xpToNext / 1000) * 100;

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-64 h-full flex flex-col border-r border-white/5 bg-obsidian/90 backdrop-blur-xl shrink-0"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/dashboard" className="font-display text-2xl tracking-widest text-snow">
          AGI<span className="text-fire">R</span>HEO
        </Link>
        <div className="text-xs font-mono text-ash tracking-widest mt-0.5">EXECUTION SYSTEM</div>
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-ember/20 border border-ember/30 flex items-center justify-center shrink-0">
            <span className="font-heading font-bold text-sm text-ember">
              {profile?.full_name?.[0]?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-heading font-semibold text-snow truncate">
              {profile?.full_name || 'Warrior'}
            </div>
            <div className="text-xs font-mono text-ash">LV {profile?.level || 1}</div>
          </div>
          <div className="ml-auto">
            <ChevronRight className="w-4 h-4 text-ash" />
          </div>
        </div>
        {/* XP Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-ash">
            <span>XP</span>
            <span>{xpToNext}/1000</span>
          </div>
          <div className="h-1.5 bg-iron rounded-full overflow-hidden">
            <div
              className="h-full xp-bar-fill rounded-full"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navItems.map((item, i) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded mb-0.5 transition-all duration-150 group',
                  isActive
                    ? 'nav-active bg-ember/10'
                    : 'text-ash hover:text-silver hover:bg-white/3'
                )}
              >
                <item.icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-ember' : 'text-ash group-hover:text-silver')} />
                <span className={cn('text-xs font-mono tracking-wider', isActive ? 'text-ember' : '')}>
                  {item.label}
                </span>
                {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-ember" />}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/5 p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded text-ash hover:text-silver hover:bg-white/3 transition-all"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs font-mono tracking-wider">SETTINGS</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-ash hover:text-fire hover:bg-fire/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-mono tracking-wider">SIGN OUT</span>
        </button>
      </div>
    </motion.aside>
  );
}
