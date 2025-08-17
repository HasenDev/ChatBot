import { redis } from "@/lib/redis";
const RATE_LIMIT_WINDOW_SECONDS = 5;
const MAX_REQUESTS = 4;
export async function isRateLimited(ip: string): Promise<boolean> {
  const key = `ratelimit:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }

  return current > MAX_REQUESTS;
}
