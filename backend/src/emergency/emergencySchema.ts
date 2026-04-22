import { pool } from '../config/database';

export const ensureEmergencySchema = async () => {
  await pool.query(`
    ALTER TABLE emergencies
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS photo_url TEXT,
    ADD COLUMN IF NOT EXISTS video_url TEXT
  `);
};
