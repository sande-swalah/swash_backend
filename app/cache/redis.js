const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

async function setCache(key, value, ttlSeconds = 3600) {
  await connectRedis();

  const payload = typeof value === 'string' ? value : JSON.stringify(value);
  return redisClient.set(key, payload, {
    EX: ttlSeconds,
  });
}

async function getCache(key) {
  await connectRedis();
  const rawValue = await redisClient.get(key);

  if (rawValue === null) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (error) {
    return rawValue;
  }
}

async function deleteCache(key) {
  await connectRedis();
  return redisClient.del(key);
}

async function clearCache() {
  await connectRedis();
  return redisClient.flushAll();
}

module.exports = {
  redisClient,
  connectRedis,
  setCache,
  getCache,
  deleteCache,
  clearCache,
};
