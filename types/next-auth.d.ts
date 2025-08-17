import NextAuth from "next-auth";
declare module "next-auth" {
  interface Session {
    accessToken: string;
    user: {
      id: string;
      name: string;
      displayName: string;
      avatar: string;
      guilds: any[];
    };
  }
  interface User {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    guilds: any[];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    displayName?: string;
    avatar?: string;
    accessToken?: string;
    expiresAt?: number;
    guilds?: any[];
  }
}
