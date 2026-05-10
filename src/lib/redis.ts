import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error('REDIS_URL is not defined in environment variables');
}

const client = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff with a maximum delay of 3 seconds
      const delay = Math.min(retries * 100, 3000);
      console.log(`Redis reconnecting... Attempt ${retries}, delay ${delay}ms`);
      return delay;
    }
  }
});

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

client.on('reconnecting', () => {
  console.log('Redis Client Reconnecting');
});

client.on('ready', () => {
  console.log('Redis Client Ready');
});

client.on('end', () => {
  console.log('Redis Client Connection Ended');
});

let connectionPromise: Promise<void> | null = null;

/**
 * Ensures the Redis client is connected and returns it.
 */
export const getRedisClient = async () => {
  if (client.isOpen) {
    return client;
  }

  if (connectionPromise) {
    await connectionPromise;
    return client;
  }

  connectionPromise = (async () => {
    try {
      if (!client.isOpen) {
        await client.connect();
      }
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      connectionPromise = null; // Reset so next attempt can try again
      throw error;
    }
  })();

  try {
    await connectionPromise;
  } finally {
    connectionPromise = null;
  }
  
  return client;
};

/**
 * Gracefully disconnects the Redis client.
 */
export const disconnectRedis = async () => {
  if (client.isOpen) {
    try {
      await client.quit();
      console.log('Redis client disconnected gracefully');
    } catch (error) {
      console.error('Error during Redis disconnection:', error);
      // Force disconnect if quit fails
      await client.disconnect();
    }
  }
};

// Handle graceful shutdown for serverless and long-running processes
if (process.env.NODE_ENV !== 'test') {
  const shutdown = async () => {
    await disconnectRedis();
    // In development, Next.js doesn't exit the process on HMR, 
    // but in production, we should exit after cleanup if this was a signal
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  try {
    const redis = await getRedisClient();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Redis get error for key ${key}:`, error);
    return null;
  }
};

export const setCachedData = async (key: string, data: any, ttlSeconds: number = 3600): Promise<void> => {
  try {
    const redis = await getRedisClient();
    await redis.set(key, JSON.stringify(data), {
      EX: ttlSeconds
    });
  } catch (error) {
    console.error(`Redis set error for key ${key}:`, error);
  }
};

export const deleteCachedData = async (key: string): Promise<void> => {
  try {
    const redis = await getRedisClient();
    await redis.del(key);
  } catch (error) {
    console.error(`Redis delete error for key ${key}:`, error);
  }
};
