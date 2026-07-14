export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/adminAuth";

// Only these tables are reachable through this route, and only these columns
// can be modified per table — prevents an admin request from touching
// arbitrary tables/columns (e.g. auth-related columns) even if the request
// body tried to.
const EDITABLE_FIELDS: Record<string, string[]> = {
  resume_analyses: ["resume_text", "resume_score", "ats_score", "analysis"],
  job_matches: ["job_description", "match_percentage", "result"],
  mock_interviews: ["role", "interview_type", "difficulty", "transcript", "final_rating"],
  roadmaps: ["roadmap"],
  notes: ["title", "content", "pinned"],
  saved_questions: ["question", "category"],
};

function isValidTable(table: string): table is keyof typeof EDITABLE_FIELDS {
  return table in EDITABLE_FIELDS;
}

// GET /api/admin/records?table=resume_analyses
// Lists every row across all users, newest first, joined with the owner's
// profile name/email-ish info where possible.
export async function GET(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const table = req.nextUrl.searchParams.get("table") || "";
  if (!isValidTable(table)) {
    return NextResponse.json({ error: "Invalid table." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();

  const { data: records, error } = await admin
    .from(table)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Attach the owning user's name for display, in a second query rather
  // than a join (keeps this generic across tables with different shapes).
  const userIds = Array.from(new Set((records || []).map((r: any) => r.user_id).filter(Boolean)));
  let profilesById: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds);
    profilesById = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.full_name || "Unnamed user"]));
  }

  const enriched = (records || []).map((r: any) => ({
    ...r,
    owner_name: profilesById[r.user_id] || "Unknown user",
  }));

  return NextResponse.json({ records: enriched });
}

// PATCH /api/admin/records  body: { table, id, updates }
export async function PATCH(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { table, id, updates } = await req.json();
  if (!isValidTable(table) || !id || !updates || typeof updates !== "object") {
    return NextResponse.json({ error: "table, id, and updates are required." }, { status: 400 });
  }

  const allowedFields = EDITABLE_FIELDS[table];
  const safeUpdates: Record<string, unknown> = {};
  for (const key of Object.keys(updates)) {
    if (allowedFields.includes(key)) safeUpdates[key] = updates[key];
  }

  if (Object.keys(safeUpdates).length === 0) {
    return NextResponse.json({ error: "No editable fields in the update." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from(table).update(safeUpdates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/admin/records  body: { table, id }
export async function DELETE(req: NextRequest) {
  const adminId = await requireAdmin(req);
  if (!adminId) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const { table, id } = await req.json();
  if (!isValidTable(table) || !id) {
    return NextResponse.json({ error: "table and id are required." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const { error } = await admin.from(table).delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
