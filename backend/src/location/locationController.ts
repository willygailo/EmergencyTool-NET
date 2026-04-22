import { Request, Response } from 'express';
import { pool } from '../config/database';
import { createClient } from 'redis';
import { v4 as uuidv4 } from 'uuid';

type RedisHash = Record<string, string>;

const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => (retries > 2 ? new Error('Redis unavailable') : 500),
  },
});

let redisReady = false;
let redisWarningShown = false;

const warnRedisUnavailable = () => {
  if (!redisWarningShown) {
    redisWarningShown = true;
    console.warn('⚠ Redis unavailable. Continuing without Redis cache.');
  }
};

redis.on('ready', () => {
  redisReady = true;
  redisWarningShown = false;
  console.log('✅ Redis connected');
});

redis.on('error', () => {
  redisReady = false;
  warnRedisUnavailable();
});

void redis.connect().catch(() => {
  redisReady = false;
  warnRedisUnavailable();
});

const getCachedHash = async (key: string): Promise<RedisHash | null> => {
  if (!redisReady) {
    return null;
  }

  try {
    const cached = await redis.hGetAll(key);
    return Object.keys(cached).length > 0 ? cached : null;
  } catch {
    redisReady = false;
    warnRedisUnavailable();
    return null;
  }
};

const setCachedHash = async (key: string, value: RedisHash): Promise<void> => {
  if (!redisReady) {
    return;
  }

  try {
    await redis.hSet(key, value);
  } catch {
    redisReady = false;
    warnRedisUnavailable();
  }
};

const setCachedField = async (key: string, field: string, value: string): Promise<void> => {
  if (!redisReady) {
    return;
  }

  try {
    await redis.hSet(key, field, value);
  } catch {
    redisReady = false;
    warnRedisUnavailable();
  }
};

export const locationController = {
  shareLocation: async (req: Request, res: Response) => {
    try {
      const { latitude, longitude, accuracy } = req.body;
      const userId = (req as any).user?.userId;
      
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      
      const id = uuidv4();
      
      await pool.query(
        `INSERT INTO locations (id, user_id, latitude, longitude, accuracy) 
         VALUES ($1, $2, $3, $4, $5)`,
        [id, userId, latitude, longitude, accuracy]
      );
      
      await setCachedHash(`user:${userId}:location`, {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        updatedAt: new Date().toISOString()
      });
      
      res.json({ id, latitude, longitude, userId });
    } catch (error) {
      console.error('Share location error:', error);
      res.status(500).json({ error: 'Failed to share location' });
    }
  },

  getCurrentLocation: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      
      const cached = await getCachedHash(`user:${userId}:location`);
      if (cached && cached.latitude) {
        return res.json({
          latitude: parseFloat(cached.latitude),
          longitude: parseFloat(cached.longitude),
          updatedAt: cached.updatedAt,
          cached: true
        });
      }
      
      const result = await pool.query(
        `SELECT latitude, longitude, created_at 
         FROM locations WHERE user_id = $1 
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      
      res.json(result.rows[0] || null);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get location' });
    }
  },

  getLocationHistory: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const { limit = 100 } = req.query;
      
      const result = await pool.query(
        `SELECT * FROM locations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
        [userId, limit]
      );
      
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get location history' });
    }
  },

  startTracking: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      
      await setCachedField(`user:${userId}:tracking`, 'enabled', 'true');
      
      res.json({ message: 'Tracking started', userId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to start tracking' });
    }
  },

  stopTracking: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      
      await setCachedField(`user:${userId}:tracking`, 'enabled', 'false');
      
      res.json({ message: 'Tracking stopped', userId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to stop tracking' });
    }
  },

  getLiveLocation: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      const cached = await getCachedHash(`user:${userId}:location`);
      if (cached && cached.latitude) {
        return res.json({
          userId,
          latitude: parseFloat(cached.latitude),
          longitude: parseFloat(cached.longitude),
          updatedAt: cached.updatedAt
        });
      }
      
      res.status(404).json({ error: 'Location not found' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get live location' });
    }
  },

  generateShareableLink: async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.userId;
      const token = uuidv4().slice(0, 8);
      
      const latestLocation = await pool.query(
        `SELECT latitude, longitude FROM locations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );
      
      if (latestLocation.rows.length === 0) {
        return res.status(400).json({ error: 'No location to share' });
      }
      
      const { latitude, longitude } = latestLocation.rows[0];
      
      const linkResult = await pool.query(
        `INSERT INTO shareable_locations (token, user_id, latitude, longitude, expires_at) 
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours') 
         RETURNING *`,
        [token, userId, latitude, longitude]
      );
      
      const shareUrl = `${process.env.FRONTEND_URL}/locate/${token}`;
      
      res.json({ 
        token, 
        url: shareUrl, 
        expiresAt: linkResult.rows[0].expires_at,
        latitude, 
        longitude 
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate link' });
    }
  },

  getSharedLocation: async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const result = await pool.query(
        `SELECT * FROM shareable_locations WHERE token = $1 AND expires_at > NOW()`,
        [token]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Link expired or not found' });
      }
      
      const { latitude, longitude, created_at } = result.rows[0];
      
      res.json({
        token,
        latitude,
        longitude,
        mapUrl: `https://maps.google.com/?q=${latitude},${longitude}`,
        createdAt: created_at
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get shared location' });
    }
  },
};

export default locationController;
