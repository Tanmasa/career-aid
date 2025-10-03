import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Database = any;

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL または anon key が設定されていません (.env.local を確認してください)。');
  }

  return { url, key };
};

export const createServerSupabaseClient = <T = Database>(): SupabaseClient<T> => {
  const { url, key } = getSupabaseConfig();

  return createClient<T>(url, key, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false
    }
  });
};

export const createBrowserSupabaseClient = <T = Database>(): SupabaseClient<T> => {
  const { url, key } = getSupabaseConfig();

  return createClient<T>(url, key);
};
