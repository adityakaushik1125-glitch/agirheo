'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Zap, Target, TrendingUp, Shield, Users, BarChart2 } from 'lucide-react';

export default function HomePage() {
  const features = [
    { icon: Target, name: 'CLARITY ENGINE', desc: 'Define your goal with surgical precision. Why, outcome, deadline, sacrifice, identity.' },
    { icon: Zap, name: 'MISSION SYSTEM', desc: 'Daily execution with critical tasks, focus timers, and zero tolerance for skipping.' },
    { icon: TrendingUp, name: 'STREAK TRACKER', desc: 'Dopamine-grade visual streaks that make you afraid to break the chain.' },
    { icon: BarChart2, name: 'FEEDBACK SYSTEM', desc: 'Brutal honest AI feedback comparing your reality vs your potential.' },
    { icon: Shield, name: 'ENVIRONMENT CONTROL', desc: 'See what your competition is doing. Build your tribe. Lock in focus mode.' },
    { icon: Users, name: 'LEVERAGE PANEL', desc: 'Daily intelligence on your field so you move smarter and faster than anyone.' },
  ];

  return (
    <main className="min-h-screen bg-void bg-grid overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-void/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-3xl tracking-widest text-snow"
          >
            AGI<span className="text-fire">R</span>HEO
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/auth/login" className="text-silver text-sm font-heading font-medium hover:text-snow transition-colors px-4 py-2">
              SIGN IN
            </Link>
            <Link href="/auth/signup" className="btn-ember px-5 py-2.5 rounded text-sm font-heading font-bold tracking-wider">
              BEGIN →
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-ember/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fire/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-ember/3 to-transparent rounded-full" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ember/30 bg-ember/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
            <span className="text-xs font-mono text-silver tracking-widest">SYSTEM ONLINE — EXECUTE NOW</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-[clamp(4rem,12vw,10rem)] leading-none tracking-widest mb-6"
          >
            <span className="text-snow">YOU WERE</span>
            <br />
            <span className="text-ember ember-glow-text">BUILT TO</span>
            <br />
            <span className="text-snow">WIN.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-silver text-xl font-body max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Agirheo is not a productivity app. It is a system that understands you, prepares you, and holds you accountable to the version of yourself you claim you want to become.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/auth/signup"
              className="btn-ember px-10 py-4 rounded text-lg font-heading font-bold tracking-wider flex items-center gap-3 group"
            >
              START YOUR MISSION
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login"
              className="px-10 py-4 rounded text-lg font-heading font-medium text-silver border border-white/10 hover:border-ember/30 hover:text-snow transition-all"
            >
              CONTINUE MISSION
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto"
          >
            {[
              { val: '6', label: 'CORE SYSTEMS' },
              { val: '∞', label: 'YOUR POTENTIAL' },
              { val: '0', label: 'EXCUSES ALLOWED' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-5xl text-ember">{stat.val}</div>
                <div className="text-xs font-mono text-ash tracking-widest mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="font-mono text-xs text-ash tracking-widest mb-4">THE ARSENAL</div>
            <h2 className="font-display text-6xl text-snow tracking-widest">6 SYSTEMS.<br /><span className="text-ember">ONE MISSION.</span></h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-void card-hover rounded-lg p-8 group"
              >
                <div className="w-12 h-12 rounded bg-ember/10 border border-ember/20 flex items-center justify-center mb-6 group-hover:bg-ember/20 transition-colors">
                  <f.icon className="w-6 h-6 text-ember" />
                </div>
                <div className="font-heading font-bold text-xs tracking-widest text-ash mb-3">{f.name}</div>
                <p className="text-silver text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ember/3 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="font-display text-7xl text-snow tracking-widest mb-8">
              STOP PLANNING.<br />
              <span className="text-ember ember-glow-text">START EXECUTING.</span>
            </div>
            <p className="text-silver mb-12 text-lg">Every day you wait is a day your competition gains ground. Your future self is watching. Make them proud.</p>
            <Link href="/auth/signup"
              className="btn-ember px-12 py-5 rounded text-xl font-heading font-bold tracking-wider inline-flex items-center gap-3 group"
            >
              I AM READY
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="font-display text-2xl tracking-widest text-snow/60">
            AGI<span className="text-fire">R</span>HEO
          </div>
          <div className="text-ash text-xs font-mono">© 2025 AGIRHEO. BUILT FOR WINNERS.</div>
        </div>
      </footer>
    </main>
  );
}
