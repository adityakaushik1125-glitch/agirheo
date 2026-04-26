'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color?: 'ember' | 'neon' | 'fire' | 'gold' | 'electric' | 'violet';
  delay?: number;
  href?: string;
}

const colorMap = {
  ember: { bg: 'bg-ember/10', icon: 'text-ember', val: 'text-ember', border: 'border-ember/20' },
  neon:  { bg: 'bg-neon/10',  icon: 'text-neon',  val: 'text-neon',  border: 'border-neon/20'  },
  fire:  { bg: 'bg-fire/10',  icon: 'text-fire',  val: 'text-fire',  border: 'border-fire/20'  },
  gold:  { bg: 'bg-gold/10',  icon: 'text-gold',  val: 'text-gold',  border: 'border-gold/20'  },
  electric: { bg: 'bg-electric/10', icon: 'text-electric', val: 'text-electric', border: 'border-electric/20' },
  violet: { bg: 'bg-violet/10', icon: 'text-violet', val: 'text-violet', border: 'border-violet/20' },
};

export default function StatCard({ icon: Icon, label, value, color = 'ember', delay = 0 }: Props) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn('card-void card-hover rounded-xl p-5 border', c.border)}
    >
      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-4', c.bg)}>
        <Icon className={cn('w-5 h-5', c.icon)} />
      </div>
      <div className={cn('font-display text-4xl mb-1', c.val)}>{value}</div>
      <div className="font-mono text-xs text-ash tracking-widest">{label}</div>
    </motion.div>
  );
}
