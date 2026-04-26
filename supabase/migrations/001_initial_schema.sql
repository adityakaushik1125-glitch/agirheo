-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  days_active INTEGER DEFAULT 0,
  total_tasks_completed INTEGER DEFAULT 0,
  total_failures INTEGER DEFAULT 0,
  focus_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GOALS TABLE (Clarity Engine)
-- ============================================
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  why TEXT NOT NULL,
  outcome TEXT NOT NULL,
  deadline DATE NOT NULL,
  sacrifice TEXT NOT NULL,
  identity_statement TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
  category TEXT DEFAULT 'general',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE (Mission System)
-- ============================================
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_critical BOOLEAN DEFAULT FALSE,
  is_minimum BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'failed')),
  scheduled_date DATE DEFAULT CURRENT_DATE,
  focus_duration INTEGER DEFAULT 25,
  actual_duration INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STREAKS TABLE (Consistent Tracker)
-- ============================================
CREATE TABLE streaks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  last_active_date DATE,
  streak_data JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DAILY LOGS TABLE (Feedback System)
-- ============================================
CREATE TABLE daily_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE DEFAULT CURRENT_DATE,
  what_avoided TEXT,
  discipline_breaks TEXT,
  fix_tomorrow TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 10),
  productivity_score INTEGER CHECK (productivity_score BETWEEN 1 AND 10),
  ai_feedback TEXT,
  tasks_completed INTEGER DEFAULT 0,
  tasks_failed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- ============================================
-- COMMUNITY TABLE (Environment Control)
-- ============================================
CREATE TABLE community_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  connected_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

CREATE TABLE community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'update' CHECK (post_type IN ('update', 'win', 'accountability', 'challenge')),
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEVERAGE TABLE (Leverage Panel)
-- ============================================
CREATE TABLE leverage_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  action_item TEXT,
  source TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'danger', 'success', 'mission')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE leverage_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view connected users goals" ON goals FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM community_connections 
    WHERE user_id = auth.uid() AND connected_user_id = goals.user_id AND status = 'accepted'
  )
);

-- Tasks policies
CREATE POLICY "Users can manage own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can manage own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Connected users can view streaks" ON streaks FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM community_connections 
    WHERE user_id = auth.uid() AND connected_user_id = streaks.user_id AND status = 'accepted'
  )
);

-- Daily logs policies
CREATE POLICY "Users can manage own logs" ON daily_logs FOR ALL USING (auth.uid() = user_id);

-- Community policies
CREATE POLICY "Users can manage own connections" ON community_connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Connected users can view connections" ON community_connections FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = connected_user_id
);
CREATE POLICY "Users can manage own posts" ON community_posts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "All users can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "All users can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON post_comments FOR ALL USING (auth.uid() = user_id);

-- Leverage policies
CREATE POLICY "Users can manage own leverage" ON leverage_insights FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER: Update profile updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_scheduled_date ON tasks(scheduled_date);
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date);
CREATE INDEX idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
