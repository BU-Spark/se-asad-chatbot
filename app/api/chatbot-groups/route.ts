// app/api/chatbot-groups/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase_admin } from "@/lib/supabase_admin";

type Group = {
  id: string;
  name: string;
  assistant_ids: string[];
  created_at: string;
};

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    // not signed in → just show nothing
    return NextResponse.json([] as Group[], { status: 200 });
  }

  const { data, error } = await supabase_admin
    .from("Users")
    .select("chatbot_groups")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (error) {
    console.error("GET /chatbot-groups error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const groups: Group[] = (data?.chatbot_groups ?? []) as Group[];
  return NextResponse.json(groups, { status: 200 });
}

export async function POST(req: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = (body.name || "").trim();
  if (!name) {
    return NextResponse.json({ message: "Name is required" }, { status: 400 });
  }

  const { data: existing, error: getErr } = await supabase_admin
    .from("Users")
    .select("chatbot_groups")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (getErr) {
    console.error("POST /chatbot-groups load error:", getErr);
    return NextResponse.json({ message: getErr.message }, { status: 500 });
  }

  const groups: Group[] = (existing?.chatbot_groups ?? []) as Group[];

  const newGroup: Group = {
    id: crypto.randomUUID(),
    name,
    assistant_ids: [],
    created_at: new Date().toISOString(),
  };

  const updatedGroups = [newGroup, ...groups];

  const { error: updErr } = await supabase_admin
    .from("Users")
    .update({ chatbot_groups: updatedGroups })
    .eq("clerk_id", clerkId);

  if (updErr) {
    console.error("POST /chatbot-groups update error:", updErr);
    return NextResponse.json({ message: updErr.message }, { status: 500 });
  }

  return NextResponse.json(newGroup, { status: 201 });
}
