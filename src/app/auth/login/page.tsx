'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Welcome back, warrior.');
      window.location.href = '/dashboard';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void bg-grid flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-ember/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="block font-display text-4xl tracking-widest text-snow text-center mb-10">
          AGI<span className="text-fire">R</span>HEO
        </Link>

        <div className="card-void rounded-xl p-8">
          <div className="mb-8">
            <h1 className="font-heading font-bold text-2xl text-snow tracking-wide">CONTINUE MISSION</h1>
            <p className="text-ash text-sm mt-1">Your goals are waiting. Don't leave them waiting long.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-ash tracking-widest mb-2">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input-void w-full px-4 py-3 rounded text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-ash tracking-widest mb-2">PASSWORD</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="input-void w-full px-4 py-3 rounded text-sm pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-silver"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-ember w-full py-3.5 rounded font-heading font-bold tracking-wider flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ENTER THE SYSTEM'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-ash">
            No account?{' '}
            <Link href="/auth/signup" className="text-ember hover:text-fire transition-colors font-medium">
              Begin your mission
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
