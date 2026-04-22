import { Router, Response } from 'express';
import { pool } from '../config/database';

const router = Router();

router.get('/circle', async (req, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const result = await pool.query(
      'SELECT f.*, json_agg(json_build_object(\'id\', fm.id, \'name\', fm.name, \'email\', fm.email, \'status\', fm.status)) as members FROM families f LEFT JOIN family_members fm ON fm.family_id = f.id WHERE f.user_id = $1 GROUP BY f.id',
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get family circle' });
  }
});

router.post('/circle', async (req, res: Response) => {
  try {
    const { name } = req.body;
    const userId = (req as any).user?.userId;
    const result = await pool.query(
      'INSERT INTO families (user_id, name) VALUES ($1, $2) RETURNING *',
      [userId, name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create family circle' });
  }
});

router.post('/circle/:id/checkin', async (req, res: Response) => {
  try {
    const { status } = req.body;
    const userId = (req as any).user?.userId;
    await pool.query(
      'UPDATE family_members SET status = $1, last_checkin = NOW() WHERE family_id = $2 AND user_id = $3',
      [status, req.params.id, userId]
    );
    res.json({ message: 'Check-in recorded' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check in' });
  }
});

router.post('/circle/:id/members', async (req, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const result = await pool.query(
      'INSERT INTO family_members (family_id, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, name, email, phone]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

export default router;