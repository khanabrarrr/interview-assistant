export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

// GET: list all users with their profile info
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();

  const { data: profiles, error } = await admin
    .from("profiles")
    .select("id, full_name, degree, career_goal, is_admin, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: profiles });
}

// DELETE: remove a user by id (body: { userId: string })
export async function DELETE(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: "userId is required." }, { status: 400 });
  }
  if (userId === adminId) {
    return NextResponse.json({ error: "You can't delete your own account here." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
