import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { requireUserId } from "@/lib/useAccount";
import { generateMessage } from "@/lib/Generate";
import { generateChatName } from "@/lib/GenerateName";

const ALLOWED_MODELS = ["gemini-pro-2-5", "llama-4-scout", "deepseek-r1", "openai/gpt-oss-120b"];
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function nonOverlappingSuffix(prev: string, chunk: string) {
  if (!prev || !chunk) return chunk;
  const maxCheck = Math.min(prev.length, chunk.length);
  for (let k = maxCheck; k > 0; k--) {
    if (prev.slice(-k) === chunk.slice(0, k)) {
      return chunk.slice(k);
    }
  }
  return chunk;
}

async function tryGenerateAndStream({
  model,
  think,
  messages,
  encoder,
  ctrl,
}: {
  model: string;
  think: boolean;
  messages: any[];
  encoder: TextEncoder;
  ctrl: ReadableStreamDefaultController;
}): Promise<{ content: string; fallback?: boolean }> {
  const doLegacyStream = async (usedModel: string) => {
    let full = "";
    await generateMessage({
      model: usedModel as any,
      think,
      messages,
      onToken: (t: string) => {
        full += t;
        try {
          ctrl.enqueue(encoder.encode(t));
        } catch (e) {}
      },
    });
    return { content: full };
  };

  if (model === "gemini-pro-2-5") {
    let full = "";
    const splitForImmediate = (text: string) => {
      const m = text.match(/(\S+\s*)/g);
      return m ?? [];
    };

    const wordQueue: { text: string; ts: number }[] = [];
    let arrivalTimestamps: number[] = [];
    let generationEnded = false;
    let generationError: any = null;

    if (think) {
      const thinkText =
        "<think>\nDue to google limitations. We cannot show the thinking process of Gemini 2.5 Pro\n</think>\n";
      const thinkTokens = splitForImmediate(thinkText);
      for (const tok of thinkTokens) {
        const toEmit = nonOverlappingSuffix(full, tok);
        if (toEmit.length > 0) {
          full += toEmit;
          try {
            ctrl.enqueue(encoder.encode(toEmit));
          } catch (e) {
            break;
          }
        }
        await sleep(30);
      }
    }

    const onToken = (t: string) => {
      const ts = Date.now();
      wordQueue.push({ text: t, ts });
      arrivalTimestamps.push(ts);
      const now = Date.now();
      const window = 2000;
      while (arrivalTimestamps.length && now - arrivalTimestamps[0] > window) {
        arrivalTimestamps.shift();
      }
    };

    const pump = async () => {
      const minWps = 30;
      const maxWps = 70;
      const smoothingMs = 800;
      while (!generationEnded || wordQueue.length > 0) {
        const now = Date.now();
        const recent = arrivalTimestamps.filter((t) => now - t <= smoothingMs);
        const arrivalRate = Math.max(1, recent.length / (Math.max(1, smoothingMs) / 1000));
        let desiredWps = Math.round(arrivalRate * 0.9);
        if (desiredWps < minWps) desiredWps = minWps;
        if (desiredWps > maxWps) desiredWps = maxWps;
        const delayMs = Math.round(1000 / desiredWps);
        if (wordQueue.length === 0) {
          await sleep(50);
          if (generationError) throw generationError;
          continue;
        }
        const item = wordQueue.shift()!;
        const token = item.text;
        const toEmit = nonOverlappingSuffix(full, token);
        if (toEmit.length > 0) {
          full += toEmit;
          try {
            ctrl.enqueue(encoder.encode(toEmit));
          } catch (e) {
            throw e;
          }
        }
        await sleep(delayMs);
      }
    };

    const pumpPromise = pump().catch((e) => {
      generationError = e;
      generationEnded = true;
      throw e;
    });

    try {
      await generateMessage({
        model,
        think,
        messages,
        onToken,
      });
      generationEnded = true;
      await pumpPromise;
      return { content: full };
    } catch (e: any) {
      generationError = e;
      generationEnded = true;
      try {
        await pumpPromise;
      } catch {}
      throw e;
    }
  } else {
    try {
      return await doLegacyStream(model);
    } catch (e: any) {
      throw e;
    }
  }
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const { chatId, message, model, think } = await req.json();

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }
  if (!ALLOWED_MODELS.includes(model)) {
    return NextResponse.json({ error: "Invalid model" }, { status: 400 });
  }

  const chats = await getCollection("chatdb", "chats");
  const cid = chatId ? new ObjectId(chatId) : new ObjectId();

  if (!chatId) {
    let name: string;
    try {
      name = await generateChatName(message);
    } catch {
      const count = await chats.countDocuments({ ownerId: userId });
      name = `Chat #${count + 1}`;
    }
    await chats.insertOne({
      _id: cid,
      ownerId: userId,
      name,
      model,
      shared: false,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const userMsgId = new ObjectId();
  const aiMsgId = new ObjectId();

  const userMsg = {
    _id: userMsgId,
    role: "user",
    content: message,
    createdAt: new Date(),
    think: !!think,
  };
  await chats.updateOne(
    { _id: cid, ownerId: userId },
    {
      $push: { messages: userMsg },
      $set: { updatedAt: new Date(), model },
    }
  );

  const chatDoc = await chats.findOne({ _id: cid, ownerId: userId });
  if (!chatDoc) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const history = chatDoc.messages.map((m: any) => ({
    role: m.role,
    content: m.content,
  }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(ctrl) {
      try {
        try {
          const result = await tryGenerateAndStream({
            model,
            think,
            messages: history,
            encoder,
            ctrl,
          });
          try {
            ctrl.close();
          } catch {}
          const aiMsg = {
            _id: aiMsgId,
            role: "assistant",
            content: result.content.trim(),
            createdAt: new Date(),
            think: !!think,
          };
          await chats.updateOne(
            { _id: cid, ownerId: userId },
            {
              $push: { messages: aiMsg },
              $set: { updatedAt: new Date() },
            }
          );
        } catch (genErr: any) {
          if (model === "deepseek-r1" && genErr?.message?.includes?.("tokens per minute")) {
            try {
              const result = await tryGenerateAndStream({
                model: "gemini-pro-2-5",
                think,
                messages: history,
                encoder,
                ctrl,
              });
              try {
                ctrl.close();
              } catch {}
              const aiMsg = {
                _id: aiMsgId,
                role: "assistant",
                content: result.content.trim(),
                createdAt: new Date(),
                think: !!think,
              };
              await chats.updateOne(
                { _id: cid, ownerId: userId },
                {
                  $push: { messages: aiMsg },
                  $set: { updatedAt: new Date() },
                }
              );
            } catch (fallbackErr) {
              await chats.updateOne(
                { _id: cid, ownerId: userId },
                { $pull: { messages: { _id: userMsgId } } }
              );
              ctrl.error(fallbackErr);
            }
          } else {
            await chats.updateOne(
              { _id: cid, ownerId: userId },
              { $pull: { messages: { _id: userMsgId } } }
            );
            ctrl.error(genErr);
          }
        }
      } catch (e) {
        try {
          await chats.updateOne(
            { _id: cid, ownerId: userId },
            { $pull: { messages: { _id: userMsgId } } }
          );
        } catch {}
        ctrl.error(e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Chat-Id": cid.toString(),
      "X-User-Message-Id": userMsgId.toString(),
      "X-Ai-Message-Id": aiMsgId.toString(),
    },
  });
}
