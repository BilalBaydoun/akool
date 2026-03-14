import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserProfile = {
  id: string;
  username: string;
  avatar_url: string | null;
  is_donor: boolean;
  donation_amount: number;
  show_donation: boolean;
  badge: string | null;
  created_at: string;
};

export type ForumPost = {
  id: string;
  user_id: string | null;
  author_name: string;
  topic: string;
  title: string;
  body: string;
  created_at: string;
  profiles?: UserProfile;
};

export type ForumReply = {
  id: string;
  post_id: string;
  user_id: string | null;
  author_name: string;
  body: string;
  is_ai: boolean;
  created_at: string;
  profiles?: UserProfile;
};

export type ContentSubmission = {
  id: string;
  user_id: string;
  type: 'article' | 'youtube';
  url: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  ai_review: string | null;
  created_at: string;
  profiles?: UserProfile;
};
