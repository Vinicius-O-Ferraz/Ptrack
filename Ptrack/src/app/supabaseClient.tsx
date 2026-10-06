const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const webStorage = {
  getItem: async (key) => {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.localStorage.getItem(key);
  },

  setItem: async (key, value) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(key, value);
  },

  removeItem: async (key) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }
);
