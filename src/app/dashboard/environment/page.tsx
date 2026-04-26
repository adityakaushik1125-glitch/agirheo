'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { Profile, CommunityPost, CommunityConnection } from '@/types';
import {
  Shield, Users, Search, Plus, Send, Trophy, Flame,
  CheckCircle2, MessageCircle, Heart, Loader2, UserPlus, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

type PostType = 'update' | 'win' | 'accountability' | 'challenge';

const POST_TYPE_CONFIG: Record<PostType, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  update: { label: 'UPDATE', color: 'text-electric', icon: MessageCircle },
  win: { label: 'WIN 🏆', color: 'text-gold', icon: Trophy },
  accountability: { label: 'ACCOUNTABILITY', color: 'text-ember', icon: Flame },
  challenge: { label: 'CHALLENGE', color: 'text-violet', icon: CheckCircle2 },
};

const COMPETITOR_PROFILES = [
  { name: 'Alex Chen', role: 'Entrepreneur', currentActivity: 'Deep work session — 3hrs', streak: 47, tasksToday: 8, recentWin: 'Closed $50K deal', status: 'EXECUTING' },
  { name: 'Maya Patel', role: 'Athlete / Builder', currentActivity: 'Morning training + cold plunge', streak: 89, tasksToday: 12, recentWin: 'Published first newsletter', status: 'CRUSHING IT' },
  { name: 'Jordan Lee', role: 'Software Dev', currentActivity: 'Shipping product feature', streak: 34, tasksToday: 6, recentWin: 'Side project hit 1K users', status: 'IN FLOW' },
  { name: 'Sam Torres', role: 'Investor', currentActivity: 'Reading + portfolio review', streak: 120, tasksToday: 10, recentWin: '3x ROI on recent bet', status: 'ON FIRE 🔥' },
];

export default function EnvironmentPage() {
  const [posts, setPosts] = useState<(CommunityPost & { profiles?: Profile })[]>([]);
  const [connections, setConnections] = useState<CommunityConnection[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState<PostType>('update');
  const [activeTab, setActiveTab] = useState<'feed' | 'network' | 'competitors'>('feed');
  const [posting, setPosting] = useState(false);
  const [userId, setUserId] = useState('');
  const [searching, setSearching] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [{ data: postsData }, { data: connectionsData }] = await Promise.all([
      supabase.from('community_posts').select('*, profiles(*)').order('created_at', { ascending: false }).limit(20),
      supabase.from('community_connections').select('*').eq('user_id', user.id),
    ]);

    if (postsData) setPosts(postsData as (CommunityPost & { profiles?: Profile })[]);
    if (connectionsData) setConnections(connectionsData);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('full_name', `%${searchQuery}%`)
      .neq('id', userId)
      .limit(10);
    if (data) setSearchResults(data);
    setSearching(false);
  };

  const handleConnect = async (targetId: string) => {
    const { error } = await supabase.from('community_connections').insert({
      user_id: userId,
      connected_user_id: targetId,
      status: 'accepted',
    });
    if (!error) {
      toast.success('Connected! You are now accountability partners.');
      loadData();
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setPosting(true);
    const { error } = await supabase.from('community_posts').insert({
      user_id: userId,
      content: newPost,
      post_type: postType,
    });
    if (!error) {
      toast.success('Posted to your network.');
      setNewPost('');
      loadData();
    }
    setPosting(false);
  };

  const handleLike = async (postId: string, currentLikes: number) => {
    await supabase.from('community_posts').update({ likes: currentLikes + 1 }).eq('id', postId);
    loadData();
  };

  const isConnected = (targetId: string) => connections.some(c => c.connected_user_id === targetId && c.status === 'accepted');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="font-mono text-xs text-ash tracking-widest mb-2 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-ember" />
          ENVIRONMENT CONTROL
        </div>
        <h1 className="font-heading font-bold text-3xl text-snow">YOUR ENVIRONMENT</h1>
        <p className="text-silver text-sm mt-1">You are the average of who you surround yourself with.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-iron/40 rounded-lg p-1 w-fit">
        {(['feed', 'network', 'competitors'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded font-mono text-xs tracking-wider transition-all',
              activeTab === tab ? 'bg-ember text-void font-bold' : 'text-ash hover:text-silver'
            )}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-5">
          {/* Post composer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-void rounded-xl p-5">
            <div className="flex gap-2 mb-4 flex-wrap">
              {(Object.entries(POST_TYPE_CONFIG) as [PostType, typeof POST_TYPE_CONFIG[PostType]][]).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={cn(
                    'px-3 py-1.5 rounded text-xs font-mono border transition-all flex items-center gap-1.5',
                    postType === type
                      ? `${config.color} bg-white/10 border-white/20`
                      : 'text-ash border-white/8 hover:border-white/15'
                  )}
                >
                  <config.icon className="w-3 h-3" />
                  {config.label}
                </button>
              ))}
            </div>
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Share your progress, a win, or call yourself out..."
              rows={3}
              className="input-void w-full px-4 py-3 rounded text-sm resize-none mb-3"
            />
            <div className="flex justify-end">
              <button
                onClick={handlePost}
                disabled={posting || !newPost.trim()}
                className="btn-ember px-5 py-2.5 rounded font-heading font-bold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                POST
              </button>
            </div>
          </motion.div>

          {/* Posts */}
          {posts.length === 0 ? (
            <div className="card-void rounded-xl p-12 text-center">
              <Users className="w-10 h-10 text-ash mx-auto mb-3" />
              <p className="text-ash text-sm">No posts yet. Be the first to share your progress.</p>
            </div>
          ) : (
            posts.map((post, i) => {
              const config = POST_TYPE_CONFIG[post.post_type as PostType] || POST_TYPE_CONFIG.update;
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-void rounded-xl p-5 card-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-ember/20 border border-ember/30 flex items-center justify-center shrink-0">
                      <span className="font-heading font-bold text-sm text-ember">
                        {(post.profiles?.full_name || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-heading font-semibold text-snow text-sm">
                          {post.profiles?.full_name || 'Anonymous'}
                        </span>
                        <span className={cn('text-xs font-mono px-2 py-0.5 rounded border border-white/10 bg-white/5', config.color)}>
                          {config.label}
                        </span>
                        <span className="text-xs font-mono text-ash ml-auto">
                          {format(new Date(post.created_at), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-silver text-sm leading-relaxed">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() => handleLike(post.id, post.likes)}
                          className="flex items-center gap-1.5 text-xs text-ash hover:text-fire transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5" />
                          {post.likes}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-5">
          {/* Search */}
          <div className="card-void rounded-xl p-5">
            <div className="font-mono text-xs text-ash tracking-widest mb-4">FIND ACCOUNTABILITY PARTNERS</div>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name..."
                className="input-void flex-1 px-4 py-3 rounded text-sm"
              />
              <button onClick={handleSearch} disabled={searching} className="btn-ember px-5 py-3 rounded font-heading font-bold text-sm flex items-center gap-2">
                {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4 space-y-3">
                {searchResults.map(profile => (
                  <div key={profile.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                    <div className="w-9 h-9 rounded-full bg-electric/20 border border-electric/30 flex items-center justify-center">
                      <span className="font-heading font-bold text-sm text-electric">
                        {(profile.full_name || 'A')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-heading font-semibold text-snow text-sm">{profile.full_name}</div>
                      <div className="text-xs font-mono text-ash">LV {profile.level} · {profile.xp} XP</div>
                    </div>
                    {isConnected(profile.id) ? (
                      <span className="text-xs font-mono text-neon px-3 py-1.5 rounded border border-neon/20 bg-neon/5">CONNECTED</span>
                    ) : (
                      <button onClick={() => handleConnect(profile.id)} className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border border-ember/30 text-ember hover:bg-ember/10 transition-colors">
                        <UserPlus className="w-3.5 h-3.5" />
                        CONNECT
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connections count */}
          <div className="card-void rounded-xl p-5">
            <div className="font-mono text-xs text-ash tracking-widest mb-2">YOUR NETWORK</div>
            <div className="font-display text-5xl text-ember">{connections.filter(c => c.status === 'accepted').length}</div>
            <div className="text-ash text-sm mt-1">accountability partners</div>
          </div>
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-fire/10 border border-fire/30 mb-2">
            <Shield className="w-4 h-4 text-fire" />
            <p className="text-sm text-fire font-heading font-semibold">
              REALITY CHECK: While you were hesitating, these people were executing.
            </p>
          </div>

          {COMPETITOR_PROFILES.map((comp, i) => (
            <motion.div
              key={comp.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-void rounded-xl p-5 card-hover competitor-pulse"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ember/30 to-fire/30 border border-ember/40 flex items-center justify-center">
                    <span className="font-heading font-bold text-ember">{comp.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-heading font-bold text-snow">{comp.name}</div>
                    <div className="text-xs font-mono text-ash">{comp.role}</div>
                  </div>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-neon/10 border border-neon/20 text-neon">
                  {comp.status}
                </span>
              </div>

              <div className="bg-iron/40 rounded-lg px-4 py-3 mb-4">
                <div className="text-xs font-mono text-ash mb-1">RIGHT NOW →</div>
                <div className="text-sm text-silver">{comp.currentActivity}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-display text-2xl text-ember">{comp.streak}</div>
                  <div className="text-xs font-mono text-ash">DAY STREAK</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-2xl text-neon">{comp.tasksToday}</div>
                  <div className="text-xs font-mono text-ash">TASKS TODAY</div>
                </div>
                <div className="text-center border-l border-white/8">
                  <div className="text-xs font-mono text-gold mt-1">RECENT WIN</div>
                  <div className="text-xs text-silver mt-1">{comp.recentWin}</div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="card-void rounded-xl p-5 border border-ember/20 text-center">
            <div className="font-display text-4xl text-ember mb-2">?</div>
            <div className="font-heading font-bold text-snow mb-1">WHERE ARE YOU ON THIS LIST?</div>
            <p className="text-ash text-sm">Your competition isn't resting. Stop reading this and go execute.</p>
          </div>
        </div>
      )}
    </div>
  );
}
