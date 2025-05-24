import { createClient } from 'redis';

let redisClient = null;

const setupRedis = async () => {
  // Skip Redis setup if disabled
  if (process.env.REDIS_ENABLED !== 'true') {
    console.log('Redis is disabled in environment');
    return null;
  }

  try {
    // Create Redis client with proper error handling
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.warn('Redis max retries reached, giving up...');
            return new Error('Redis max retries reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    // Event handlers
    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Redis Client Connected');
    });

    redisClient.on('ready', () => {
      console.log('Redis Client Ready');
    });

    redisClient.on('end', () => {
      console.log('Redis Client Connection Ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.warn('Redis setup failed:', error.message);
    return null;
  }
};

// Export a function to get the Redis client
export const getRedisClient = () => {
  if (process.env.REDIS_ENABLED !== 'true') {
    return null;
  }
  return redisClient;
};

export { setupRedis }; 