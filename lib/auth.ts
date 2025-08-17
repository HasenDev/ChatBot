import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import bcrypt from "bcryptjs";
import FlakeId from "flake-idgen";
import intformat from "biguint-format";
import { getCollection } from "./mongodb";
import type { User } from "@/types/user";
const flake = new FlakeId();
type ExtendedToken = JWT & {
  id?: string;
  email?: string;
  username?: string;
  displayName?: string;
  avatar?: string;
  accessToken?: string;
  refreshToken?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: { params: { scope: "identify email" } },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const users = await getCollection<User & { id?: string }>(
          "admiBot",
          "users"
        );
        const user = await users.findOne({ email: credentials.email });
        if (!user || !user.passwordHash) return null;
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;
        let uid = user.id;
        if (!uid) {
          uid = intformat(flake.next(), "dec");
          await users.updateOne({ _id: user._id }, { $set: { id: uid } });
        }
        return {
          id: uid,
          email: user.email,
          name: user.username,
          image: user.avatar,
          displayName: user.username,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      const ext = token as ExtendedToken;
      if (account?.provider === "discord" && profile) {
        const dp = profile as any;
        ext.id = dp.id;
        ext.email = dp.email;
        ext.username = dp.username;
        ext.displayName = `${dp.username}#${dp.discriminator}`;
        ext.avatar = dp.avatar
          ? `https://cdn.discordapp.com/avatars/${dp.id}/${dp.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${
              parseInt(dp.discriminator) % 5
            }.png`;
        ext.accessToken = account.access_token;
        ext.refreshToken = account.refresh_token;
      }
      if (user) {
        const u = user as any;
        ext.id = u.id;
        ext.email = u.email;
        ext.username = u.name;
        ext.displayName = u.displayName;
        ext.avatar = u.image;
      }
      if (ext.id) token.id = ext.id;
      if (ext.email) token.email = ext.email;
      if (ext.username) token.name = ext.username;
      if (ext.avatar) token.picture = ext.avatar;
      token.displayName = ext.displayName;
      token.accessToken = ext.accessToken;
      return token;
    },
    async session({ session, token }) {
      const ext = token as ExtendedToken;
      session.user = {
        id: ext.id!,
        name: ext.username || session.user.name!,
        email: ext.email || session.user.email!,
        image: ext.avatar || session.user.image!,
        displayName: ext.displayName || session.user.name!,
      };
      session.accessToken = ext.accessToken;

      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
