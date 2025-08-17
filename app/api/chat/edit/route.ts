import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireUserId } from "@/lib/useAccount";
import { generateMessage } from "@/lib/Generate";
export async function POST(req: Request) {
  const userId = await requireUserId();
  const { chatId, messageId, newContent, model, think } = await req.json();
  const cid = new ObjectId(chatId);
  const chats = await getCollection("chatdb", "chats");
  const chat = await chats.findOne({ _id: cid, ownerId: userId });
  if (!chat) return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  const idx = chat.messages.findIndex((m: any) => m._id.toString() === messageId);
  if (idx === -1 || chat.messages[idx].role !== "user") {
    return NextResponse.json({ error: "User message not found" }, { status: 404 });
  }
  const edited = { ...chat.messages[idx], content: newContent, editedAt: new Date() };
  const trimmed = chat.messages.slice(0, idx).concat(edited);
  await chats.updateOne(
    { _id: cid },
    { $set: { messages: trimmed, updatedAt: new Date() } }
  );
  const context = trimmed.map((m: any) => ({ role: m.role, content: m.content }));
  const encoder = new TextEncoder();
  let reply = "";

  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        await generateMessage({
          model,
          think,
          messages: context,
          onToken: (t) => { reply += t; ctrl.enqueue(encoder.encode(t)); }
        });
        ctrl.close();
        await chats.updateOne(
          { _id: cid },
          {
            $push: { 
              messages: {
                _id: new ObjectId(),
                role: "assistant",
                content: reply.trim(),
                createdAt: new Date(),
                think: !!think,
              }
            },
            $set: { updatedAt: new Date() },
          }
        );
      } catch (e) {
        await chats.updateOne(
          { _id: cid },
          { $set: { messages: chat.messages, updatedAt: new Date() } }
        );
        ctrl.error(e);
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
