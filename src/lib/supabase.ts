import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Helper to identify if environment variables are placeholders
const isPlaceholder = (url?: string, key?: string) => {
  if (!url || !key) return true;
  return (
    url.includes("your-project.supabase.co") ||
    key.includes("your-anon-key-here")
  );
};

// Create a safe mock client for graceful degradation when unconfigured
const createMockClient = (): any => {
  console.warn(
    "⚠️ [StudyFlow] Supabase is not configured or is using placeholder keys in .env.local.\n" +
    "Client-side Supabase features (like real-time alerts or task updates) are mocked.\n" +
    "To enable them, set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your active Supabase project keys."
  );

  const mockQueryBuilder = {
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    eq: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => mockQueryBuilder,
    channel: () => ({
      on: () => ({
        subscribe: () => ({})
      })
    }),
    removeChannel: () => {},
  };
};

export const createClient = (): SupabaseClient<any> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isPlaceholder(url, anonKey)) {
    return createMockClient() as unknown as SupabaseClient<any>;
  }

  return createBrowserClient<any>(url!, anonKey!);
};


