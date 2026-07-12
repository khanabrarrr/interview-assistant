import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for use in the browser (respects Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with elevated privileges — only import this in API routes,
// never in client components. Requires SUPABASE_SERVICE_ROLE_KEY.
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
