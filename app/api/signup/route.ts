import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getCollection } from "@/lib/mongodb";
import type { User } from "@/types/user";
import FlakeId from "flake-idgen";
import intformat from "biguint-format";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
const flake = new FlakeId();
const ipRateLimitMap = new Map<string, number[]>();
const rateLimit = (ip: string, max: number, windowMs: number): boolean => {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = ipRateLimitMap.get(ip)?.filter((ts) => ts > windowStart) || [];
  timestamps.push(now);
  ipRateLimitMap.set(ip, timestamps);
  return timestamps.length <= max;
};
export async function POST(req: Request) {
  const ip = req.headers.get("cf-connecting-ip") || "unknown";
  if (!rateLimit(ip, 2, 5000)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait and try again." },
      { status: 429 }
    );
  }
  if (!rateLimit(ip, 5, 6000)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  try {
    const { email, username, password, avatar, acceptTermsAndPrivacyPolicy } = await req.json();

    if (!email || !username || !password || acceptTermsAndPrivacyPolicy !== true) {
      return NextResponse.json(
        { error: "Missing required fields or terms not accepted" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3–30 characters, only letters, numbers, and underscores allowed",
        },
        { status: 400 }
      );
    }

    const usersCollection = await getCollection<User>("admiBot", "users");
    const existing = await usersCollection.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }
    const userId = intformat(flake.next(), "dec");
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User & { id: string } = {
      id: userId,
      email,
      username,
      passwordHash,
      avatar: avatar || "https://cdn.discordapp.com/embed/avatars/1.png",
      createdAt: new Date(),
    };
    await usersCollection.insertOne(newUser);
    return NextResponse.json({ success: true, id: userId });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
