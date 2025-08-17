import { Groq } from "groq-sdk";
const GROQ_API_KEY = process.env.GROQ_API_KEY!;
if (!GROQ_API_KEY) {
  throw new Error("Missing GROQ_API_KEY in environment");
}
const groq = new Groq({ apiKey: GROQ_API_KEY });
export async function generateChatName(userInput: string): Promise<string> {
  const messages = [
    {
      role: "system" as const,
      content:
        "Generate a 3 words chat title based on the user input, nothing else. " +
        'Make sure the chat name is in JSON in the "name" field. ' +
        'Examples: "Creating Discord Bot", "Casual Conversation", "Coding Python App".',
    },
    {
      role: "user" as const,
      content: userInput,
    },
  ];
  const chatCompletion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages,
    temperature: 1,
    max_completion_tokens: 64,
    top_p: 1,
    stream: false,
    response_format: { type: "json_object" },
  });
  const choice = chatCompletion.choices?.[0];
  if (!choice || !choice.message) {
    throw new Error("No completion returned from Groq API");
  }
  const content = choice.message.content;
  let parsed: any;
  if (typeof content === "string") {
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      throw new Error(
        "Failed to parse JSON from assistant response: " + content
      );
    }
  } else {
    parsed = content;
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof parsed.name !== "string"
  ) {
    throw new Error(
      "Invalid response format, expected { name: string }, got: " +
        JSON.stringify(parsed)
    );
  }

  return parsed.name;
}
