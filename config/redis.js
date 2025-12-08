import { createClient } from "redis";

let redis;

export const connectRedis = async () => {
  if (redis) return redis; // prevent multiple connections

  redis = createClient({
    url: process.env.REDIS_URL, // <-- Important
  });

  redis.on("error", (err) => console.error("⚠️ Redis Error:", err));
  redis.on("connect", () => console.log("✅ Redis Connected"));

  await redis.connect();
  return redis;
};

export const getRedisClient = () => {
  if (!redis) {
    throw new Error("❌ Redis not initialized. Call connectRedis() first.");
  }
  return redis;
};
