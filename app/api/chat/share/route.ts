import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireUserId } from "@/lib/useAccount";
interface ShareRequest {
  chatId: string;
}
export async function POST(req: Request) {
  const userId = await requireUserId();
  let body: ShareRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { chatId } = body;
  if (!chatId) {
    return NextResponse.json({ error: "chatId is required" }, { status: 400 });
  }
  let cid: ObjectId;
  try {
    cid = new ObjectId(chatId);
  } catch {
    return NextResponse.json({ error: "Invalid chatId format" }, { status: 400 });
  }
  const chats = await getCollection<any>("chatdb", "chats");
  const chat = await chats.findOne({ _id: cid, ownerId: userId });
  if (!chat) {
    return NextResponse.json({ error: "Chat not found or not yours" }, { status: 404 });
  }
  await chats.updateOne(
    { _id: cid },
    { $set: { shared: true, updatedAt: new Date() } }
  );
  const origin = new URL(req.url).origin;
  const shareUrl = `${origin}/share/${chatId}`;
  return NextResponse.json({ shareUrl });
}
