import { pool } from '../config/database';

export const ensureUserSchema = async () => {
  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
  `);
};

