export interface User {
  _id?: string;
  email: string;
  username: string;
  passwordHash?: string;
  avatar?: string;
  discordId?: string;
  createdAt: Date;
}
