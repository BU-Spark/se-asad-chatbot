// app/api/chatbot-groups/[groupId]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase_admin } from "@/lib/supabase_admin";

type Group = {
  id: string;
  name: string;
  assistant_ids: string[];
  created_at: string;
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ groupId: string }> }
) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { groupId } = await ctx.params;

  const body = await req.json().catch(() => ({}));
  const assistantIds: string[] = Array.isArray(body.assistantIds)
    ? body.assistantIds
    : body.chatbotId
    ? [String(body.chatbotId)]
    : [];

  if (assistantIds.length === 0) {
    return NextResponse.json(
      { message: "assistantIds must be non-empty" },
      { status: 400 }
    );
  }

  const { data: existing, error: getErr } = await supabase_admin
    .from("Users")
    .select("chatbot_groups, clerk_id")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (getErr)
    return NextResponse.json({ message: getErr.message }, { status: 500 });

  console.log("POST /chatbot-groups/[groupId] clerkId:", clerkId);
  console.log("groupId from URL:", groupId);
  console.log("existing.chatbot_groups:", existing?.chatbot_groups);

  const groups: Group[] = (existing?.chatbot_groups ?? []) as Group[];
  const idx = groups.findIndex((g) => String(g.id) === String(groupId));

  if (idx === -1) {
    console.log("Group not found in array, ids present:", groups.map(g => g.id));
    return NextResponse.json({ message: "Group not found" }, { status: 404 });
  }

  const merged = Array.from(
    new Set([...(groups[idx].assistant_ids || []), ...assistantIds])
  );
  const updatedGroups = [...groups];
  updatedGroups[idx] = { ...groups[idx], assistant_ids: merged };

  const { error: updErr } = await supabase_admin
    .from("Users")
    .update({ chatbot_groups: updatedGroups })
    .eq("clerk_id", clerkId);

  if (updErr)
    return NextResponse.json({ message: updErr.message }, { status: 500 });

  return NextResponse.json({ id: groupId, assistant_ids: merged });
}
