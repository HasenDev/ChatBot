import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions, UserSession } from "@/lib/auth";
import { getCollection } from "@/lib/mongodb";
import { handleBase64Upload } from "@/lib/UploadCDN";
import { ObjectId } from "mongodb";
interface UpdateBody {
  username?: string;
  oldPassword?: string;
  newPassword?: string;
  avatar?: string | null;
}
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthenticated or session is missing email" }, { status: 401 });
  }

  const { user: sessionUser } = session as { user: UserSession };
  const { id: sessionId, email, displayName, name, image } = sessionUser;

  try {
    const users = await getCollection("admiBot", "users");
    const userFromDb = await users.findOne(
      { email },
      { projection: { passwordHash: 0 } }
    );
    if (userFromDb) {
      return NextResponse.json({
        user: userFromDb,
        accountType: "credentials",
      });
    } else {
      return NextResponse.json({
        user: {
          id: sessionId,
          username: displayName || name,
          email: email,
          avatar: image,
        },
        accountType: "discord",
      });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthenticated or session is missing email" }, { status: 401 });
  }
  const { email } = session.user;
  try {
    const users = await getCollection("admiBot", "users");
    const currentUser = await users.findOne({ email });
    if (!currentUser) {
      return NextResponse.json(
        { error: "Cannot update a Discord-authenticated account." },
        { status: 403 }
      );
    }
    const body: UpdateBody = await req.json();
    const updateFields: Partial<typeof currentUser> = {};
    if (body.username && body.username.trim() !== currentUser.username) {
      updateFields.username = body.username.trim();
    }
    if (body.newPassword) {
      if (!body.oldPassword) {
        return NextResponse.json({ error: "Old password is required to set a new one" }, { status: 400 });
      }
      const isPasswordCorrect = await bcrypt.compare(body.oldPassword, currentUser.passwordHash || "");
      if (!isPasswordCorrect) {
        return NextResponse.json({ error: "Old password is incorrect" }, { status: 400 });
      }
      updateFields.passwordHash = await bcrypt.hash(body.newPassword, 12);
    }
    if ("avatar" in body) {
      const newAvatarUrl = await handleBase64Upload(currentUser._id.toString(), body.avatar, currentUser.avatar);
      updateFields.avatar = newAvatarUrl;
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ message: "No changes to update" });
    }
    await users.updateOne({ _id: currentUser._id }, { $set: updateFields });
    const updatedUser = await users.findOne(
      { _id: currentUser._id },
      { projection: { passwordHash: 0 } }
    );

    return NextResponse.json({ user: updatedUser, accountType: "credentials" });

  } catch (error: any) {
    console.error("Error updating user profile:", error);
    if (error.name === 'SyntaxError') {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    return NextResponse.json(
      { error: `An internal server error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}