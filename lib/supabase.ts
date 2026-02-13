import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Ticket = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  age_restriction: string;
  image_url: string;
  is_active: boolean;
  created_at: string;
};

export type Combo = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number;
  includes: string[];
  image_url: string;
  is_active: boolean;
  created_at: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  is_available: boolean;
  created_at: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  type: 'ticket' | 'combo' | 'menu';
  image_url: string;
};
