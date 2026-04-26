export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
      };
      goals: {
        Row: Goal;
        Insert: Partial<Goal>;
        Update: Partial<Goal>;
      };
      tasks: {
        Row: Task;
        Insert: Partial<Task>;
        Update: Partial<Task>;
      };
      streaks: {
        Row: Streak;
        Insert: Partial<Streak>;
        Update: Partial<Streak>;
      };
      daily_logs: {
        Row: DailyLog;
        Insert: Partial<DailyLog>;
        Update: Partial<DailyLog>;
      };
      community_posts: {
        Row: CommunityPost;
        Insert: Partial<CommunityPost>;
        Update: Partial<CommunityPost>;
      };
      leverage_insights: {
        Row: LeverageInsight;
        Insert: Partial<LeverageInsight>;
        Update: Partial<LeverageInsight>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification>;
        Update: Partial<Notification>;
      };
    };
  };
}

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  xp: number;
  level: number;
  days_active: number;
  total_tasks_completed: number;
  total_failures: number;
  focus_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  why: string;
  outcome: string;
  deadline: string;
  sacrifice: string;
  identity_statement: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  category: string;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  description: string | null;
  is_critical: boolean;
  is_minimum: boolean;
  status: 'pending' | 'done' | 'failed';
  scheduled_date: string;
  focus_duration: number;
  actual_duration: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  goal_id: string | null;
  current_streak: number;
  best_streak: number;
  failure_count: number;
  last_active_date: string | null;
  streak_data: StreakDay[];
  created_at: string;
  updated_at: string;
}

export interface StreakDay {
  date: string;
  completed: boolean;
  tasks_done: number;
}

export interface DailyLog {
  id: string;
  user_id: string;
  log_date: string;
  what_avoided: string | null;
  discipline_breaks: string | null;
  fix_tomorrow: string | null;
  mood: number | null;
  productivity_score: number | null;
  ai_feedback: string | null;
  tasks_completed: number;
  tasks_failed: number;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  post_type: 'update' | 'win' | 'accountability' | 'challenge';
  likes: number;
  created_at: string;
  profiles?: Profile;
}

export interface CommunityConnection {
  id: string;
  user_id: string;
  connected_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
}

export interface LeverageInsight {
  id: string;
  user_id: string;
  goal_id: string | null;
  category: string;
  title: string;
  content: string;
  action_item: string | null;
  source: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success' | 'mission';
  is_read: boolean;
  created_at: string;
}

export interface DashboardStats {
  todayTasksTotal: number;
  todayTasksDone: number;
  todayTasksFailed: number;
  currentStreak: number;
  bestStreak: number;
  xp: number;
  level: number;
  activeGoals: number;
  weeklyScore: number;
}
