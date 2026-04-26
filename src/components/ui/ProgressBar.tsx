'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  value: number;
  max?: number;
  className?: string;
  color?: 'ember' | 'neon' | 'fire' | 'electric' | 'gold';
  showLabel?: boolean;
  animate?: boolean;
}

export default function ProgressBar({ value, max = 100, className, color = 'ember', showLabel = false, animate = true }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const colorMap = {
    ember: 'bg-ember',
    neon: 'bg-neon',
    fire: 'bg-fire',
    electric: 'bg-electric',
    gold: 'bg-gold',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-mono text-ash">
          <span>{value}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-1.5 bg-iron rounded-full overflow-hidden">
        <motion.div
          initial={animate ? { width: 0 } : { width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className={cn('h-full rounded-full', colorMap[color])}
        />
      </div>
    </div>
  );
}
