'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

const RULES = [
  'No excuses. No skipping.',
  'Done or Failed. Nothing in between.',
  'Show up every single day.',
];

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) { toast.error('Accept the commitment first.'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!fullName.trim()) { toast.error('Enter your name.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      toast.success('Account created. Let\'s begin.');
      router.push('/onboarding');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void bg-grid flex items-center justify-center px-6 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-ember/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <Link href="/" className="block font-display text-4xl tracking-widest text-snow text-center mb-10">
          AGI<span className="text-fire">R</span>HEO
        </Link>
        <div className="card-void rounded-xl p-8">
          <div className="mb-6">
            <h1 className="font-heading font-bold text-2xl text-snow tracking-wide">BEGIN YOUR MISSION</h1>
            <p className="text-ash text-sm mt-1">The person you want to become starts today.</p>
          </div>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-ash tracking-widest mb-2">YOUR NAME</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="input-void w-full px-4 py-3 rounded text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-mono text-ash tracking-widest mb-2">EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-void w-full px-4 py-3 rounded text-sm" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-xs font-mono text-ash tracking-widest mb-2">PASSWORD</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="input-void w-full px-4 py-3 rounded text-sm pr-12" placeholder="min 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-silver">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Commitment rules */}
            <div className="p-4 rounded-lg bg-ember/5 border border-ember/15 space-y-2">
              <div className="font-mono text-xs text-ember tracking-widest mb-3">THE COMMITMENT</div>
              {RULES.map(r => (
                <div key={r} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-ember shrink-0" />
                  <span className="text-xs text-silver">{r}</span>
                </div>
              ))}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="accent-ember mt-0.5 w-4 h-4 shrink-0" />
              <span className="text-xs text-silver leading-relaxed">I accept these rules and commit to showing up every single day without excuses.</span>
            </label>

            <button type="submit" disabled={loading} className="btn-ember w-full py-3.5 rounded font-heading font-bold tracking-wider flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'I COMMIT →'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-ash">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-ember hover:text-fire transition-colors font-medium">Continue mission</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
