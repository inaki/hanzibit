import { NextRequest, NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { execute, queryOne } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const card = await queryOne<{ user_id: string }>(
    "SELECT user_id FROM flashcards WHERE id = $1",
    [id]
  );

  if (!card || card.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await execute("DELETE FROM flashcards WHERE id = $1", [id]);
  return NextResponse.json({ deleted: true });
}
