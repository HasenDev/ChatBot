import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireUserId } from "@/lib/useAccount";
import { generateMessage } from "@/lib/Generate";
export async function POST(req: Request) {
  const userId = await requireUserId();
  const { chatId, regenerateFromMessageId, model, think } = await req.json();
  const cid = new ObjectId(chatId);
  const chats = await getCollection("chatdb", "chats");
  const chat = await chats.findOne({ _id: cid, ownerId: userId });
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  const idx = chat.messages.findIndex((m: any) => m._id.toString() === regenerateFromMessageId);
  if (idx === -1 || chat.messages[idx].role !== "assistant") {
    return NextResponse.json({ error: "AI message not found" }, { status: 404 });
  }
  const history = chat.messages.slice(0, idx).map((m: any) => ({
    role: m.role, content: m.content
  }));
  const encoder = new TextEncoder();
  let reply = "";

  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        await generateMessage({
          model,
          think,
          messages: history,
          onToken: (t) => { reply += t; ctrl.enqueue(encoder.encode(t)); }
        });
        ctrl.close();
        await chats.updateOne(
          { _id: cid, "messages._id": new ObjectId(regenerateFromMessageId) },
          { $set: {
              "messages.$.content": reply.trim(),
              "messages.$.think": !!think,
              "messages.$.createdAt": new Date(),
              updatedAt: new Date()
          } }
        );
      } catch (e) {
        ctrl.error(e);
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
