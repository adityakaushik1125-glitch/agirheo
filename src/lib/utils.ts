import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export function getXpToNextLevel(xp: number): number {
  return xp % 1000;
}

export function formatStreakLabel(days: number): string {
  if (days === 0) return 'No streak';
  if (days === 1) return '1 day';
  return `${days} days`;
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function getDaysUntilDeadline(deadline: string): number {
  const now = new Date();
  const dl = new Date(deadline);
  const diff = dl.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getMotivationalMessage(streak: number): string {
  if (streak === 0) return "Start today. Your future self is watching.";
  if (streak < 3) return "The chain is forming. Don't break it.";
  if (streak < 7) return "You're building momentum. Keep going.";
  if (streak < 14) return "A week of discipline. This is who you are now.";
  if (streak < 30) return "Two weeks strong. Most people quit before this.";
  if (streak < 90) return "A month in. You're in the top 1%.";
  return "You are the proof. Unstoppable.";
}
