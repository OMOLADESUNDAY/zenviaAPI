// import { createClient } from "redis";

// let redis;

// export const connectRedis = async () => {
//   if (redis) return redis; // prevent multiple connections

//   redis = createClient({
//     url: process.env.REDIS_URL, // <-- Important
//   });

//   redis.on("error", (err) => console.error("⚠️ Redis Error:", err));
//   redis.on("connect", () => console.log("✅ Redis Connected"));

//   await redis.connect();
//   return redis;
// };

// export const getRedisClient = () => {
//   if (!redis) {
//     throw new Error("❌ Redis not initialized. Call connectRedis() first.");
//   }
//   return redis;
// };


// config/redis.js
import { createClient } from "redis";

let redis = null;
let connecting = false;

export const connectRedis = async () => {
  if (redis && redis.isReady) return redis;
  if (connecting) {
    // Wait for existing connection attempt
    await new Promise(resolve => setTimeout(resolve, 100));
    return connectRedis();
  }

  connecting = true;
  
  try {
    redis = createClient({
      url: process.env.REDIS_URL,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) return false;
          return Math.min(retries * 100, 3000);
        },
      },
    });

    redis.on("error", (err) => console.error("Redis Error:", err.message));
    redis.on("connect", () => console.log("Redis Connected"));

    await redis.connect();
    connecting = false;
    return redis;
  } catch (error) {
    connecting = false;
    console.error("Redis connection failed:", error.message);
    throw error;
  }
};

export const getRedisClient = async () => {
  if (!redis || !redis.isReady) {
    return await connectRedis();
  }
  return redis;
};