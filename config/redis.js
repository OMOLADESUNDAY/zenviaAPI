

import { createClient } from "redis";

let redis;

export const connectRedis = async () => {
  redis = createClient();

  redis.on("error", (err) => console.log("Redis Error:", err));
  redis.on("connect", () => console.log("Redis Connected"));

  await redis.connect();
};

export const getRedisClient = () => {
  if (!redis) {
    throw new Error("❌ Redis not initialized. Call connectRedis() first.");
  }
  return redis;
};
