import { NextResponse, type NextRequest } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireUserId } from "@/lib/useAccount";

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  let userId: string;

  try {
    userId = await requireUserId();
  } catch (resp) {
    return resp as NextResponse;
  }
  const chatId = params.chatId;
  if (!ObjectId.isValid(chatId)) {
    return NextResponse.json(
      { error: "Invalid chat ID." },
      { status: 400 }
    );
  }

  try {
    const chats = await getCollection<any>("chatdb", "chats");
    const cid = new ObjectId(chatId);
    const found = await chats.findOne({ _id: cid });

    if (!found) {
      return NextResponse.json(
        { error: "Chat not found." },
        { status: 404 }
      );
    }

    if (found.ownerId === userId) {
      return NextResponse.json({
        chatId,
        messages: found.messages || [],
      });
    }

    if (found.shared) {
      const copyId = new ObjectId();
      await chats.insertOne({
        _id: copyId,
        ownerId: userId,
        name: found.name || "Untitled",
        model: found.model || "default",
        shared: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: found.messages || [],
      });

      return NextResponse.json({
        chatId: copyId.toHexString(),
        messages: found.messages || [],
      });
    }

    return NextResponse.json(
      { error: "Forbidden: You do not have access to this chat." },
      { status: 403 }
    );
  } catch (err) {
    console.error("Error loading chat:", err);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
