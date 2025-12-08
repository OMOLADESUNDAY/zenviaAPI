import { connectRedis, getRedisClient } from './config/redis.js';

const testRedis = async () => {
  try {
    // Step 1: Connect Redis
    await connectRedis();
    console.log('✅ Redis connected');

    // Step 2: Get the client
    const redis = getRedisClient();

    // Step 3: Test a command
    await redis.set('ping', 'pong', { EX: 10 });
    const value = await redis.get('ping');
    console.log('Redis test value:', value);
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
};

testRedis();
