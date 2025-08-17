import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getCollection } from "./mongodb";
export async function requireUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const userId = session.user.id;
  const isDiscordId = /^\d{17,19}$/.test(userId);
  if (isDiscordId) {
    return userId;
  }
  try {
    const users = await getCollection("admiBot", "users");
    const exists = await users.findOne({ id: userId });
    if (!exists) {
      throw NextResponse.json({ error: "User not found" }, { status: 401 });
    }
  } catch (err) {
    console.error("[requireUserId] Error while verifying user in the database |>  ", err);
    throw NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
  return userId;
}
