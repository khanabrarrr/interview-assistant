import { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Verifies the request's Bearer token belongs to a logged-in user whose
 * profile has is_admin = true. Returns the user id if authorized, or null.
 */
export async function requireAdmin(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) return null;

  const admin = getSupabaseAdmin();

  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;

  return user.id;
}
