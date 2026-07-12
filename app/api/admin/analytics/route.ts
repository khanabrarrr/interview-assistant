import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

// GET: returns simple platform-wide counts for the admin dashboard
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const admin = getSupabaseAdmin();

  const [users, resumeAnalyses, jobMatches, mockInterviews, notes] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("resume_analyses").select("id", { count: "exact", head: true }),
    admin.from("job_matches").select("id", { count: "exact", head: true }),
    admin.from("mock_interviews").select("id", { count: "exact", head: true }),
    admin.from("notes").select("id", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    totalUsers: users.count ?? 0,
    totalResumeAnalyses: resumeAnalyses.count ?? 0,
    totalJobMatches: jobMatches.count ?? 0,
    totalMockInterviews: mockInterviews.count ?? 0,
    totalNotes: notes.count ?? 0,
  });
}
