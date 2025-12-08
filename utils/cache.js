// src/middlewares/cache.js
import {getRedisClient} from "../config/redis.js";

export const cacheMiddleware = (keyGenerator, ttl = 3600) => {
  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);

      const cached = await getRedisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }

      // override res.json to store in cache
      const originalJson = res.json.bind(res);
      res.json = async (data) => {
        await getRedisClient.set(key, JSON.stringify(data), { EX: ttl });
        originalJson(data);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };
};
