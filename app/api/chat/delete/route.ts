import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/mongodb";
import { requireUserId } from "@/lib/useAccount";

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch (resp) {
    return resp as NextResponse;
  }

  try {
    const { chatId } = await req.json();

    if (!chatId || typeof chatId !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing chatId." },
        { status: 400 }
      );
    }

    const chats = await getCollection("chatdb", "chats");

    const deletionResult = await chats.deleteOne({
      _id: new ObjectId(chatId),
      ownerId: userId,
    });

    if (deletionResult.deletedCount === 0) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting chat:", err);
    return NextResponse.json(
      { error: "Failed to delete chat." },
      { status: 500 }
    );
  }
}
