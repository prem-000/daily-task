import { createServerClient as createSupabaseServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '../types/supabase';
import { createClient } from '@supabase/supabase-js';

// Helper to identify if environment variables are placeholders
const isPlaceholder = (url?: string, key?: string) => {
  if (!url || !key) return true;
  return (
    url.includes("your-project.supabase.co") ||
    key.includes("your-anon-key-here")
  );
};

// Create a safe mock server client to avoid network crashes on server routes
const createMockServerClient = (): any => {
  console.warn(
    "⚠️ [StudyFlow] Server-side Supabase is not configured or is using placeholder keys in .env.local.\n" +
    "Server-side Supabase features are mocked."
  );

  const mockQueryBuilder = {
    select: () => Promise.resolve({ data: [], error: null }),
    insert: (payload: any) => {
      // Mock successful insert returning the mock records back
      const records = Array.isArray(payload) ? payload : [payload];
      const inserted = records.map((r, i) => ({
        id: `mock-task-${Date.now()}-${i}`,
        ...r,
        created_at: new Date().toISOString(),
      }));
      return {
        select: () => Promise.resolve({ data: inserted, error: null })
      };
    },
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    eq: () => mockQueryBuilder,
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
    },
    from: () => mockQueryBuilder,
  };
};

export const createServerClient = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isPlaceholder(url, anonKey)) {
    return createMockServerClient();
  }

  const cookieStore = await cookies();
  return createSupabaseServerClient<any>(
    url!,
    anonKey!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored when called from Server Components
          }
        },
      },
    }
  );
};

export const createRouteClient = async () => {
  return await createServerClient();
};

export const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey || url.includes("your-project.supabase.co") || serviceRoleKey.includes("your-service-role-key")) {
    console.warn("⚠️ [StudyFlow] Supabase Admin client is using mocked behavior (missing credentials).");
    return null;
  }

  return createClient<any>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

