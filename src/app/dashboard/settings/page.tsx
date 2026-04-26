'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types';
import { Settings, User, Bell, Shield, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<Profile>>({});
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState('');
  const supabase = createClient();

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
  };

  const saveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: profile.full_name,
      username: profile.username,
      bio: profile.bio,
    }).eq('id', userId);
    if (error) toast.error(error.message);
    else toast.success('Profile updated.');
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="font-mono text-xs text-ash tracking-widest mb-2 flex items-center gap-2">
          <Settings className="w-3.5 h-3.5 text-ember" />
          SETTINGS
        </div>
        <h1 className="font-heading font-bold text-3xl text-snow">ACCOUNT SETTINGS</h1>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-void rounded-xl p-6 mb-5">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-ember" />
          <span className="font-mono text-xs text-ash tracking-widest">PROFILE</span>
        </div>

        <div className="space-y-4">
          {[
            { key: 'full_name', label: 'FULL NAME', placeholder: 'Your name' },
            { key: 'username', label: 'USERNAME', placeholder: '@handle' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-mono text-ash tracking-widest mb-2">{label}</label>
              <input
                type="text"
                value={(profile as Record<string, string | number | boolean | null>)[key] as string || ''}
                onChange={e => setProfile({ ...profile, [key]: e.target.value })}
                placeholder={placeholder}
                className="input-void w-full px-4 py-3 rounded text-sm"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-mono text-ash tracking-widest mb-2">BIO</label>
            <textarea
              value={profile.bio || ''}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              placeholder="What are you building?"
              rows={3}
              className="input-void w-full px-4 py-3 rounded text-sm resize-none"
            />
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="btn-ember mt-5 px-6 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          SAVE CHANGES
        </button>
      </motion.div>

      {/* Stats card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-void rounded-xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-ember" />
          <span className="font-mono text-xs text-ash tracking-widest">YOUR STATS</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'LEVEL', val: profile.level || 1 },
            { label: 'TOTAL XP', val: profile.xp || 0 },
            { label: 'TASKS COMPLETED', val: profile.total_tasks_completed || 0 },
            { label: 'TOTAL FAILURES', val: profile.total_failures || 0 },
          ].map(({ label, val }) => (
            <div key={label} className="bg-iron/40 rounded-lg p-4">
              <div className="font-display text-3xl text-ember">{val}</div>
              <div className="font-mono text-xs text-ash mt-1">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
