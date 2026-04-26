'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Flame, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'WELCOME TO AGIRHEO',
    subtitle: 'Before we begin, understand what this is.',
    content: 'This is not a to-do app. This is not a planner. This is a system that will hold you accountable to the version of yourself you claim you want to become. It will ask hard questions. It will show you hard truths. Are you ready?',
    cta: 'I AM READY',
  },
  {
    id: 'commitment',
    title: 'THE COMMITMENT',
    subtitle: 'This platform only works if you do.',
    content: 'Most people quit in 3 days. The system works after 21. Every feature you use — every goal you set, every task you complete, every streak you build — compounds. The results are not instant. The discipline must be.',
    cta: 'I UNDERSTAND',
  },
  {
    id: 'rules',
    title: 'THE RULES',
    subtitle: 'Three non-negotiables.',
    rules: [
      { num: '01', text: 'Set your goals with full honesty. No vague goals. No soft deadlines.' },
      { num: '02', text: 'Every task is either DONE or FAILED. There is no skip. There is no maybe.' },
      { num: '03', text: 'Daily reflection is not optional. You face your results every single day.' },
    ],
    cta: 'I ACCEPT',
  },
  {
    id: 'identity',
    title: 'WHO ARE YOU BECOMING?',
    subtitle: 'Not who you are. Who you are becoming.',
    inputLabel: 'Complete this: "I am becoming someone who..."',
    inputPlaceholder: 'executes every single day without excuses...',
    cta: 'THIS IS ME',
    hasInput: true,
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const handleNext = async () => {
    if (isLast) {
      if (!identity.trim()) { toast.error('Complete your identity statement.'); return; }
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({
          bio: `I am becoming someone who ${identity}`,
        }).eq('id', user.id);
        // Create main streak tracker
        const { data: existing } = await supabase
          .from('streaks')
          .select('id')
          .eq('user_id', user.id)
          .is('goal_id', null)
          .maybeSingle();
        if (!existing) {
          await supabase.from('streaks').insert({ user_id: user.id });
        }
        // Create welcome notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'MISSION STARTED',
          message: 'Your journey begins today. Set your first goal in the Clarity Engine.',
          type: 'mission',
        });
      }
      toast.success('Welcome to the system. Now execute.');
      router.push('/dashboard');
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-void bg-grid flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ember/3 rounded-full blur-3xl" />
      </div>

      {/* Progress dots */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {ONBOARDING_STEPS.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-ember' : i < step ? 'w-4 bg-ember/40' : 'w-4 bg-white/10'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl w-full"
        >
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-6">
              <Flame className="w-6 h-6 text-ember" />
              <span className="font-mono text-xs text-ash tracking-widest">AGIRHEO SYSTEM</span>
            </div>
            <div className="font-mono text-xs text-ember tracking-widest mb-3">STEP {step + 1} OF {ONBOARDING_STEPS.length}</div>
            <h1 className="font-display text-5xl md:text-7xl tracking-widest text-snow mb-3">{current.title}</h1>
            <p className="text-ash font-mono text-sm tracking-wide">{current.subtitle}</p>
          </div>

          {/* Content */}
          <div className="card-void rounded-2xl p-8 md:p-12 mb-8">
            {'content' in current && (
              <p className="text-silver text-lg leading-relaxed text-center">{current.content}</p>
            )}

            {'rules' in current && (
              <div className="space-y-5">
                {current.rules?.map(rule => (
                  <div key={rule.num} className="flex items-start gap-5">
                    <span className="font-display text-4xl text-ember/40 shrink-0 leading-none">{rule.num}</span>
                    <p className="text-silver text-base leading-relaxed pt-1">{rule.text}</p>
                  </div>
                ))}
              </div>
            )}

            {'hasInput' in current && current.hasInput && (
              <div className="space-y-4">
                <label className="block font-mono text-xs text-ember tracking-widest">{current.inputLabel}</label>
                <div className="flex items-start gap-3">
                  <span className="text-silver text-sm pt-3.5 shrink-0">I am becoming someone who</span>
                </div>
                <textarea
                  value={identity}
                  onChange={e => setIdentity(e.target.value)}
                  placeholder={current.inputPlaceholder}
                  rows={4}
                  className="input-void w-full px-4 py-3 rounded text-sm resize-none"
                  autoFocus
                />
                <p className="text-ash text-xs italic">This becomes your identity statement — the foundation of every goal you set.</p>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center">
            <motion.button
              onClick={handleNext}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-ember px-12 py-4 rounded text-lg font-heading font-bold tracking-wider inline-flex items-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {current.cta}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
