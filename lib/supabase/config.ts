// lib/supabase/config.ts
import { createClient } from '@supabase/supabase-js'

// Disable locks to fix the "lock was stolen" error in React Strict Mode
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Disable the navigator lock that causes the error
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
)