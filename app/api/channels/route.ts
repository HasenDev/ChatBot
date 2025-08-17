import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { requireUserId } from "@/lib/useAccount";
export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (resp) {
    return resp as NextResponse;
  }
  try {
    const chats = await getCollection<any>("chatdb", "chats");
    const list = await chats
      .find({ ownerId: userId })
      .sort({ updatedAt: -1 })
      .project({ name: 1, _id: 1, updatedAt: 1 })
      .toArray();
    return NextResponse.json({ chats: list });
  } catch (err) {
    console.error("Error fetching channels:", err);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}
