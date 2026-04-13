import { NextRequest } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getOwnedFlashcard } from "@/lib/data";
import { execute } from "@/lib/db";
import { mobileError, mobileOk } from "@/lib/mobile-api";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: Params) {
  const userId = await getMobileUserId(req);
  if (!userId) return mobileError("Unauthorized", 401);

  const { id } = await params;
  const card = await getOwnedFlashcard(userId, id);
  if (!card) {
    return mobileError("Not found", 404);
  }

  await execute("DELETE FROM flashcards WHERE id = $1", [id]);
  return mobileOk({ deleted: true });
}
