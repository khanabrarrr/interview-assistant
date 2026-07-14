import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for use in the browser (respects Row Level Security).
// Uses @supabase/ssr's createBrowserClient rather than the plain
// @supabase/supabase-js createClient — the plain client can end up
// instantiated more than once across different page bundles in Next.js,
// which causes the "Multiple GoTrueClient instances" warning and random
// session loss when navigating between pages. createBrowserClient avoids
// this by managing the session as a proper singleton.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server-side client with elevated privileges — only import this in API routes,
// never in client components. Requires SUPABASE_SERVICE_ROLE_KEY.
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
